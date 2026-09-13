import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function SchemaComparison() {

    const navigate = useNavigate();
    const location = useLocation();

    const selectedEntities =
        location.state?.selectedEntities || [];

    const [sourceSchema, setSourceSchema] = useState("");
    const [targetSchema, setTargetSchema] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCompare = async () => {

        // Validation

        if (!sourceSchema.trim()) {
            setError("Please enter the source DB schema.");
            return;
        }

        if (!targetSchema.trim()) {
            setError("Please enter the target DB schema.");
            return;
        }

        if (selectedEntities.length === 0) {
            setError("No entities have been selected.");
            return;
        }

        setError("");
        setLoading(true);

        try {

            /*
             * Convert selected entities into
             * RecommendedMappings format.
             *
             * Example:
             *
             * selectedEntities:
             * [
             *   "Customer",
             *   "Order"
             * ]
             *
             * becomes:
             *
             * [
             *   {
             *     sourceTable: "Customer"
             *   },
             *   {
             *     sourceTable: "Order"
             *   }
             * ]
             */

            const recommendedMappings =
                selectedEntities.map((entity) => {

                    /*
                     * The backend source table for Order
                     * is "Orders".
                     *
                     * For now we handle this mapping here.
                     */

                    if (entity === "Order") {
                        return {
                            sourceTable: "Orders"
                        };
                    }

                    return {
                        sourceTable: entity
                    };
                });

            const requestBody = {
                SourceSchema: sourceSchema,
                TargetSchema: targetSchema,
                RecommendedMappings: recommendedMappings
            };

            console.log(
                "Schema Comparison Request:",
                requestBody
            );

            const response = await fetch(
                "https://b7xiolvvbj.execute-api.us-east-1.amazonaws.com/prod/schema-comparison",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {

                throw new Error(
                    `Schema comparison failed: ${response.status}`
                );

            }

            const result = await response.json();

            console.log(
                "Schema Comparison Response:",
                result
            );

            /*
             * Navigate to the mapping result page
             * and pass the API response.
             */

            navigate("/mappings", {
                state: {
                    selectedEntities,
                    comparisonResult: result,
                    sourceSchema,
                    targetSchema
                }
            });

        } catch (err) {

            console.error(
                "Schema comparison error:",
                err
            );

            setError(
                err.message ||
                "Failed to compare schemas."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="page">

            <div className="page-header">

                <h1>Schema Comparison</h1>

                <p>
                    Provide the source and target database
                    schemas to generate migration mappings.
                </p>

            </div>

            {/* Selected Entities */}

            <div className="summary-card">

                <h2>Selected Entities</h2>

                <p>
                    The following entities will be included
                    in the schema comparison.
                </p>

                <div className="selected-entity-list">

                    {selectedEntities.length === 0 ? (

                        <p>
                            No entities selected.
                        </p>

                    ) : (

                        selectedEntities.map((entity) => (

                            <span
                                className="entity-badge"
                                key={entity}
                            >
                                {entity}
                            </span>

                        ))

                    )}

                </div>

            </div>

            {/* Source Schema */}

            <div className="migration-card">

                <h2>Source DB Schema</h2>

                <p>
                    Enter the source database schema.
                </p>

                <textarea
                    rows="15"
                    placeholder="Enter source database schema..."
                    value={sourceSchema}
                    onChange={(event) =>
                        setSourceSchema(event.target.value)
                    }
                />

            </div>

            {/* Target Schema */}

            <div className="migration-card">

                <h2>Target DB Schema</h2>

                <p>
                    Enter the target database schema.
                </p>

                <textarea
                    rows="15"
                    placeholder="Enter target database schema..."
                    value={targetSchema}
                    onChange={(event) =>
                        setTargetSchema(event.target.value)
                    }
                />

            </div>

            {/* Error */}

            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}

            {/* Submit */}

            <div className="button-container">

                <button
                    className="primary-button"
                    onClick={handleCompare}
                    disabled={loading}
                >

                    {loading
                        ? "Comparing Schemas..."
                        : "Compare Schema"}

                </button>

            </div>

        </div>
    );
}

export default SchemaComparison;