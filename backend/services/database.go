package services

import (
	"database/sql"
	"fmt"
	"log"

	"halalguard-backend/database"
	"halalguard-backend/models"
)

// SaveTransaction saves a transaction to the database
func SaveTransaction(tx models.TransactionInput) error {
	query := `
		INSERT INTO transactions (id, description, amount, date, type)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE SET
			description = EXCLUDED.description,
			amount = EXCLUDED.amount,
			date = EXCLUDED.date,
			type = EXCLUDED.type
	`

	_, err := database.DB.Exec(query, tx.ID, tx.Description, tx.Amount, tx.Date, tx.Type)
	if err != nil {
		return fmt.Errorf("failed to save transaction: %w", err)
	}

	return nil
}

// SaveAnalysisResult saves analysis result to the database
func SaveAnalysisResult(result models.AnalysisResult) error {
	query := `
		INSERT INTO analysis_results (
			transaction_id, status, violation_type, confidence_score,
			riba_score, gharar_score, maysir_score, halal_score, justice_score,
			maslahah_total_score, maslahah_economic_justice, maslahah_community_dev,
			maslahah_educational, maslahah_environmental, maslahah_social_cohesion,
			maslahah_projection, reasoning, suggested_correction
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		ON CONFLICT (transaction_id) DO UPDATE SET
			status = EXCLUDED.status,
			violation_type = EXCLUDED.violation_type,
			confidence_score = EXCLUDED.confidence_score,
			riba_score = EXCLUDED.riba_score,
			gharar_score = EXCLUDED.gharar_score,
			maysir_score = EXCLUDED.maysir_score,
			halal_score = EXCLUDED.halal_score,
			justice_score = EXCLUDED.justice_score,
			maslahah_total_score = EXCLUDED.maslahah_total_score,
			maslahah_economic_justice = EXCLUDED.maslahah_economic_justice,
			maslahah_community_dev = EXCLUDED.maslahah_community_dev,
			maslahah_educational = EXCLUDED.maslahah_educational,
			maslahah_environmental = EXCLUDED.maslahah_environmental,
			maslahah_social_cohesion = EXCLUDED.maslahah_social_cohesion,
			maslahah_projection = EXCLUDED.maslahah_projection,
			reasoning = EXCLUDED.reasoning,
			suggested_correction = EXCLUDED.suggested_correction
	`

	var maslahahTotal, maslahahEconomic, maslahahCommunity, maslahahEducational, maslahahEnvironmental, maslahahSocial sql.NullFloat64
	var maslahahProjection sql.NullString

	if result.MaslahahAnalysis != nil {
		maslahahTotal = sql.NullFloat64{Float64: result.MaslahahAnalysis.TotalScore, Valid: true}
		maslahahEconomic = sql.NullFloat64{Float64: result.MaslahahAnalysis.Breakdown.EconomicJustice, Valid: true}
		maslahahCommunity = sql.NullFloat64{Float64: result.MaslahahAnalysis.Breakdown.CommunityDevelopment, Valid: true}
		maslahahEducational = sql.NullFloat64{Float64: result.MaslahahAnalysis.Breakdown.EducationalImpact, Valid: true}
		maslahahEnvironmental = sql.NullFloat64{Float64: result.MaslahahAnalysis.Breakdown.Environmental, Valid: true}
		maslahahSocial = sql.NullFloat64{Float64: result.MaslahahAnalysis.Breakdown.SocialCohesion, Valid: true}
		maslahahProjection = sql.NullString{String: result.MaslahahAnalysis.LongTermProjection, Valid: true}
	}

	_, err := database.DB.Exec(query,
		result.TransactionID, result.Status, result.ViolationType, result.ConfidenceScore,
		result.Breakdown.RibaScore, result.Breakdown.GhararScore, result.Breakdown.MaysirScore,
		result.Breakdown.HalalScore, result.Breakdown.JusticeScore,
		maslahahTotal, maslahahEconomic, maslahahCommunity, maslahahEducational,
		maslahahEnvironmental, maslahahSocial, maslahahProjection,
		result.Reasoning, result.SuggestedCorrection,
	)

	if err != nil {
		return fmt.Errorf("failed to save analysis result: %w", err)
	}

	return nil
}

// GetAllTransactions retrieves all transactions with their analysis
func GetAllTransactions() ([]models.CombinedResult, error) {
	query := `
		SELECT 
			t.id, t.description, t.amount, t.date, t.type,
			a.status, a.violation_type, a.confidence_score,
			a.riba_score, a.gharar_score, a.maysir_score, a.halal_score, a.justice_score,
			a.maslahah_total_score, a.maslahah_economic_justice, a.maslahah_community_dev,
			a.maslahah_educational, a.maslahah_environmental, a.maslahah_social_cohesion,
			a.maslahah_projection, a.reasoning, a.suggested_correction
		FROM transactions t
		LEFT JOIN analysis_results a ON t.id = a.transaction_id
		ORDER BY t.created_at DESC
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query transactions: %w", err)
	}
	defer rows.Close()

	var results []models.CombinedResult

	for rows.Next() {
		var result models.CombinedResult
		var status, violationType, reasoning sql.NullString
		var confidenceScore, ribaScore, ghararScore, maysirScore, halalScore, justiceScore sql.NullFloat64
		var maslahahTotal, maslahahEconomic, maslahahCommunity, maslahahEducational, maslahahEnvironmental, maslahahSocial sql.NullFloat64
		var maslahahProjection, suggestedCorrection sql.NullString

		err := rows.Scan(
			&result.ID, &result.Description, &result.Amount, &result.Date, &result.Type,
			&status, &violationType, &confidenceScore,
			&ribaScore, &ghararScore, &maysirScore, &halalScore, &justiceScore,
			&maslahahTotal, &maslahahEconomic, &maslahahCommunity,
			&maslahahEducational, &maslahahEnvironmental, &maslahahSocial,
			&maslahahProjection, &reasoning, &suggestedCorrection,
		)

		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		// If analysis exists, populate it
		if status.Valid {
			result.Analysis = &models.AnalysisResult{
				TransactionID:   result.ID,
				Status:          status.String,
				ViolationType:   violationType.String,
				ConfidenceScore: confidenceScore.Float64,
				Breakdown: models.ComplianceBreakdown{
					RibaScore:    ribaScore.Float64,
					GhararScore:  ghararScore.Float64,
					MaysirScore:  maysirScore.Float64,
					HalalScore:   halalScore.Float64,
					JusticeScore: justiceScore.Float64,
				},
				Reasoning:           reasoning.String,
				SuggestedCorrection: suggestedCorrection.String,
			}

			// Add Maslahah analysis if available
			if maslahahTotal.Valid {
				result.Analysis.MaslahahAnalysis = &models.MaslahahAnalysis{
					TotalScore: maslahahTotal.Float64,
					Breakdown: models.MaslahahBreakdown{
						EconomicJustice:      maslahahEconomic.Float64,
						CommunityDevelopment: maslahahCommunity.Float64,
						EducationalImpact:    maslahahEducational.Float64,
						Environmental:        maslahahEnvironmental.Float64,
						SocialCohesion:       maslahahSocial.Float64,
					},
					LongTermProjection: maslahahProjection.String,
				}
			}
		}

		results = append(results, result)
	}

	return results, nil
}

// GetTransactionByID retrieves a specific transaction with analysis
func GetTransactionByID(id string) (*models.CombinedResult, error) {
	query := `
		SELECT 
			t.id, t.description, t.amount, t.date, t.type,
			a.status, a.violation_type, a.confidence_score,
			a.riba_score, a.gharar_score, a.maysir_score, a.halal_score, a.justice_score,
			a.maslahah_total_score, a.maslahah_economic_justice, a.maslahah_community_dev,
			a.maslahah_educational, a.maslahah_environmental, a.maslahah_social_cohesion,
			a.maslahah_projection, a.reasoning, a.suggested_correction
		FROM transactions t
		LEFT JOIN analysis_results a ON t.id = a.transaction_id
		WHERE t.id = $1
	`

	var result models.CombinedResult
	var status, violationType, reasoning sql.NullString
	var confidenceScore, ribaScore, ghararScore, maysirScore, halalScore, justiceScore sql.NullFloat64
	var maslahahTotal, maslahahEconomic, maslahahCommunity, maslahahEducational, maslahahEnvironmental, maslahahSocial sql.NullFloat64
	var maslahahProjection, suggestedCorrection sql.NullString

	err := database.DB.QueryRow(query, id).Scan(
		&result.ID, &result.Description, &result.Amount, &result.Date, &result.Type,
		&status, &violationType, &confidenceScore,
		&ribaScore, &ghararScore, &maysirScore, &halalScore, &justiceScore,
		&maslahahTotal, &maslahahEconomic, &maslahahCommunity,
		&maslahahEducational, &maslahahEnvironmental, &maslahahSocial,
		&maslahahProjection, &reasoning, &suggestedCorrection,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("transaction not found")
		}
		return nil, fmt.Errorf("failed to query transaction: %w", err)
	}

	// If analysis exists, populate it
	if status.Valid {
		result.Analysis = &models.AnalysisResult{
			TransactionID:   result.ID,
			Status:          status.String,
			ViolationType:   violationType.String,
			ConfidenceScore: confidenceScore.Float64,
			Breakdown: models.ComplianceBreakdown{
				RibaScore:    ribaScore.Float64,
				GhararScore:  ghararScore.Float64,
				MaysirScore:  maysirScore.Float64,
				HalalScore:   halalScore.Float64,
				JusticeScore: justiceScore.Float64,
			},
			Reasoning:           reasoning.String,
			SuggestedCorrection: suggestedCorrection.String,
		}

		// Add Maslahah analysis if available
		if maslahahTotal.Valid {
			result.Analysis.MaslahahAnalysis = &models.MaslahahAnalysis{
				TotalScore: maslahahTotal.Float64,
				Breakdown: models.MaslahahBreakdown{
					EconomicJustice:      maslahahEconomic.Float64,
					CommunityDevelopment: maslahahCommunity.Float64,
					EducationalImpact:    maslahahEducational.Float64,
					Environmental:        maslahahEnvironmental.Float64,
					SocialCohesion:       maslahahSocial.Float64,
				},
				LongTermProjection: maslahahProjection.String,
			}
		}
	}

	return &result, nil
}
