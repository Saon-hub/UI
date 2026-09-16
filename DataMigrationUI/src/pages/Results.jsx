import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Results() {

    const navigate = useNavigate();
    const location = useLocation();

    /*
     * Get the complete response from Migration.jsx
     */
    const analysisResult =
        location.state?.analysisResult;

    const sourceSchema =
        location.state?.sourceSchema || "";

    const [selectedEntities, setSelectedEntities] =
        useState([]);

    /*
     * --------------------------------------------------
     * Parse API response
     * --------------------------------------------------
     *
     * API response:
     *
     * {
     *   statusCode: 200,
     *   headers: {...},
     *   body: "{...}",
     *   isBase64Encoded: false
     * }
     *
     * The actual analysis JSON is inside "body".
     */

    let parsedResult = null;

    if (analysisResult) {

        try {

            if (
                typeof analysisResult.body ===
                "string"
            ) {

                parsedResult =
                    JSON.parse(
                        analysisResult.body
                    );

            } else {

                parsedResult =
                    analysisResult.body ||
                    analysisResult;

            }

            console.log(
                "Parsed Schema Analysis Result:",
                parsedResult
            );

        } catch (error) {

            console.error(
                "Failed to parse Schema Analysis response:",
                error
            );

        }
    }

    /*
     * --------------------------------------------------
     * Analysis Summary
     * --------------------------------------------------
     */

    const analysisSummary =
        parsedResult?.analysis_summary || {};

    /*
     * --------------------------------------------------
     * Entities
     * --------------------------------------------------
     */

    const apiEntities =
        Array.isArray(
            parsedResult?.entities
        )
            ? parsedResult.entities
            : [];

    /*
     * Convert API entities into UI entities
     */
    const entities =
        apiEntities.map(
            (entity) => ({
                name:
                    entity.entity_name,

                description:
                    entity.description,

                schemaName:
                    entity.schema_name,

                tableName:
                    entity.table_name,

                category:
                    entity.category,

                migrationRecommendation:
                    entity.migration_recommendation,

                confidence:
                    entity.confidence,

                reason:
                    entity.reason,

                columns:
                    entity.columns,

                /*
                 * Keep original API object.
                 * This will be passed to
                 * Schema Comparison.
                 */
                originalData:
                    entity
            })
        );

    /*
     * --------------------------------------------------
     * Recommended count
     * --------------------------------------------------
     */

    const recommendedCount =
        entities.filter(
            (entity) =>
                entity.migrationRecommendation ===
                "RECOMMENDED"
        ).length;

    /*
     * --------------------------------------------------
     * Select Entity
     * --------------------------------------------------
     */

    const toggleEntity = (entityName) => {

        setSelectedEntities(
            (current) => {

                if (
                    current.includes(
                        entityName
                    )
                ) {

                    return current.filter(
                        (name) =>
                            name !== entityName
                    );
                }

                return [
                    ...current,
                    entityName
                ];
            }
        );
    };

    /*
     * --------------------------------------------------
     * Select All
     * --------------------------------------------------
     */

    const selectAll = () => {

        if (
            selectedEntities.length ===
            entities.length
        ) {

            setSelectedEntities([]);

        } else {

            setSelectedEntities(
                entities.map(
                    (entity) =>
                        entity.name
                )
            );
        }
    };

    /*
     * --------------------------------------------------
     * Continue
     * --------------------------------------------------
     */

    const handleContinue = () => {

        if (
            selectedEntities.length === 0
        ) {
            return;
        }

        /*
         * Get complete entity objects
         * selected by the user.
         */
        const selectedEntityObjects =
            entities
                .filter(
                    (entity) =>
                        selectedEntities.includes(
                            entity.name
                        )
                )
                .map(
                    (entity) =>
                        entity.originalData
                );

        console.log(
            "Selected Entities:",
            selectedEntities
        );

        console.log(
            "Selected Entity Objects:",
            selectedEntityObjects
        );

        navigate(
            "/schema-comparison",
            {
                state: {

                    selectedEntities:

                        selectedEntities,

                    selectedEntityObjects:

                        selectedEntityObjects,

                    analysisResult:

                        analysisResult,

                    sourceSchema:

                        sourceSchema
                }
            }
        );
    };

    /*
     * --------------------------------------------------
     * No result
     * --------------------------------------------------
     */

    if (!analysisResult) {

        return (
            <div className="page">

                <div className="page-header">

                    <h1>
                        Schema Analysis Result
                    </h1>

                    <p>
                        No schema analysis result
                        was found.
                    </p>

                </div>

                <div className="entities-card">

                    <p>
                        Please go back and initiate
                        the migration again.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Back
                    </button>

                </div>

            </div>
        );
    }

    /*
     * --------------------------------------------------
     * Page
     * --------------------------------------------------
     */

    return (
        <div className="page">

            <div className="page-header">

                <h1>
                    Schema Analysis Result
                </h1>

                <p>
                    Review the entities identified
                    from the source schema.
                </p>

            </div>

            <div className="summary-card">

                <h2>
                    Analysis Summary
                </h2>

                <div className="summary-grid">

                    <div>

                        <span>
                            Tables Analyzed
                        </span>

                        <strong>
                            {
                                analysisSummary
                                    .total_tables_analyzed
                                ?? 0
                            }
                        </strong>

                    </div>

                    <div>

                        <span>
                            Entities Identified
                        </span>

                        <strong>
                            {
                                analysisSummary
                                    .business_entities_identified
                                ?? entities.length
                            }
                        </strong>

                    </div>

                    <div>

                        <span>
                            Recommended
                        </span>

                        <strong>
                            {
                                analysisSummary
                                    .recommended_entities
                                ?? recommendedCount
                            }
                        </strong>

                    </div>

                    <div>

                        <span>
                            Selected
                        </span>

                        <strong>
                            {
                                selectedEntities.length
                            }
                        </strong>

                    </div>

                </div>

            </div>

            <div className="entities-card">

                <div className="entities-header">

                    <div>

                        <h2>
                            Select Entities
                        </h2>

                        <p>
                            Choose the entities you
                            want to migrate.
                        </p>

                    </div>

                    {entities.length > 0 && (

                        <button
                            className="secondary-button"
                            onClick={selectAll}
                        >

                            {
                                selectedEntities.length ===
                                entities.length

                                    ? "Deselect All"

                                    : "Select All"
                            }

                        </button>

                    )}

                </div>

                <div className="entity-list">

                    {entities.length === 0 ? (

                        <div className="error-message">

                            No entities were returned
                            by the Schema Analysis API.

                        </div>

                    ) : (

                        entities.map(
                            (entity) => (

                                <label
                                    className="entity-row"
                                    key={entity.name}
                                >

                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedEntities.includes(
                                                entity.name
                                            )
                                        }
                                        onChange={() =>
                                            toggleEntity(
                                                entity.name
                                            )
                                        }
                                    />

                                    <div>

                                        <strong>
                                            {
                                                entity.name
                                            }
                                        </strong>

                                        <p>
                                            {
                                                entity.description
                                            }
                                        </p>

                                    </div>

                                </label>
                            )
                        )

                    )}

                </div>

                <div className="selection-footer">

                    <span>
                        {
                            selectedEntities.length
                        }{" "}
                        entities selected
                    </span>

                    <button
                        className="primary-button"
                        disabled={
                            selectedEntities.length ===
                            0
                        }
                        onClick={
                            handleContinue
                        }
                    >
                        Continue
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Results;