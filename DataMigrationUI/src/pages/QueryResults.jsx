import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { runETL } from "../services/etlService";

function QueryResults() {
    const location = useLocation();
    const navigate = useNavigate();

    const queryResults =
        location.state?.queryResults || [];

    const [selectedEntities, setSelectedEntities] =
        useState([]);

    const [loading, setLoading] = useState(false);

    const [migrationResults, setMigrationResults] =
        useState([]);

    const [error, setError] = useState("");

    // --------------------------------------------------
    // Get Entity Name
    // --------------------------------------------------
    const getEntityName = (result) => {
        return (
            result.Entity ||
            result.entity ||
            ""
        );
    };

    // --------------------------------------------------
    // Get Source Extraction Query
    // --------------------------------------------------
    const getSourceQuery = (result) => {
        return (
            result.SourceExtractionQuery ||
            result.sourceExtractionQuery ||
            ""
        );
    };

    // --------------------------------------------------
    // Get Target Insertion Query
    // --------------------------------------------------
    const getTargetQuery = (result) => {
        return (
            result.TargetInsertionQuery ||
            result.targetInsertionQuery ||
            ""
        );
    };

    // --------------------------------------------------
    // Select / Unselect Entity
    // --------------------------------------------------
    const handleEntitySelection = (entity) => {
        setSelectedEntities((previous) => {
            if (previous.includes(entity)) {
                return previous.filter(
                    (item) => item !== entity
                );
            }

            return [
                ...previous,
                entity
            ];
        });

        // Clear previous migration status when
        // selection changes
        setMigrationResults([]);
        setError("");
    };

    // --------------------------------------------------
    // Select All / Unselect All
    // --------------------------------------------------
    const handleSelectAll = () => {
        if (
            selectedEntities.length ===
            queryResults.length
        ) {
            setSelectedEntities([]);
        } else {
            setSelectedEntities(
                queryResults.map((result) =>
                    getEntityName(result)
                )
            );
        }

        setMigrationResults([]);
        setError("");
    };

    // --------------------------------------------------
    // Start Migration
    // --------------------------------------------------
    const handleStartMigration = async () => {
        if (selectedEntities.length === 0) {
            setError(
                "Please select at least one entity to migrate."
            );
            return;
        }

        setError("");
        setLoading(true);
        setMigrationResults([]);

        const results = [];

        // Process each selected entity separately
        for (const entityName of selectedEntities) {
            const queryResult =
                queryResults.find(
                    (result) =>
                        getEntityName(result) ===
                        entityName
                );

            if (!queryResult) {
                results.push({
                    entity: entityName,
                    success: false,
                    message:
                        "Query result not found."
                });

                setMigrationResults([
                    ...results
                ]);

                continue;
            }

            try {
                console.log(
                    `Starting migration for ${entityName}`
                );

                await runETL(
                    getEntityName(queryResult),
                    getSourceQuery(queryResult),
                    getTargetQuery(queryResult)
                );

                console.log(
                    `Migration successful for ${entityName}`
                );

                results.push({
                    entity: entityName,
                    success: true,
                    message:
                        "Migration completed successfully."
                });
            } catch (err) {
                console.error(
                    `Migration failed for ${entityName}:`,
                    err
                );

                results.push({
                    entity: entityName,
                    success: false,
                    message:
                        err.message ||
                        "Migration failed."
                });
            }

            // Update UI after every entity
            // so the user can see progress
            setMigrationResults([
                ...results
            ]);
        }

        setLoading(false);
    };

    // --------------------------------------------------
    // No Query Results
    // --------------------------------------------------
    if (queryResults.length === 0) {
        return (
            <div
                className="page-container"
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "40px 24px"
                }}
            >
                <h1>Migration Queries</h1>

                <p>
                    No migration queries were
                    generated.
                </p>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate("/migration")
                    }
                >
                    Back to Migration
                </button>
            </div>
        );
    }

    const allSelected =
        selectedEntities.length ===
        queryResults.length;

    return (
        <div
            className="page-container"
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 24px"
            }}
        >
            {/* --------------------------------------------------
                Page Header
            -------------------------------------------------- */}
            <h1>Migration Queries</h1>

            <p
                style={{
                    marginBottom: "25px",
                    color: "#666",
                    fontSize: "15px"
                }}
            >
                Review the generated SQL queries and
                select the entities you want to migrate.
            </p>

            {/* --------------------------------------------------
                Select All
            -------------------------------------------------- */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "25px",
                    padding: "15px 18px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                }}
            >
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={loading}
                    style={{
                        width: "18px",
                        height: "18px",
                        cursor: loading
                            ? "not-allowed"
                            : "pointer"
                    }}
                />

                <strong>
                    Select All Entities
                </strong>

                <span
                    style={{
                        marginLeft: "10px",
                        color: "#666"
                    }}
                >
                    ({selectedEntities.length} of{" "}
                    {queryResults.length} selected)
                </span>
            </div>

            {/* --------------------------------------------------
                Query Results
            -------------------------------------------------- */}
            {queryResults.map(
                (result, index) => {
                    const entity =
                        getEntityName(result);

                    const sourceQuery =
                        getSourceQuery(result);

                    const targetQuery =
                        getTargetQuery(result);

                    const isSelected =
                        selectedEntities.includes(
                            entity
                        );

                    return (
                        <div
                            key={`${entity}-${index}`}
                            style={{
                                border: isSelected
                                    ? "2px solid #2563eb"
                                    : "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "20px",
                                marginBottom: "25px",
                                background: "#fff",
                                boxShadow:
                                    "0 2px 6px rgba(0,0,0,0.05)"
                            }}
                        >
                            {/* --------------------------------------------------
                                Entity Header
                            -------------------------------------------------- */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "12px",
                                    marginBottom:
                                        "20px"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        isSelected
                                    }
                                    disabled={loading}
                                    onChange={() =>
                                        handleEntitySelection(
                                            entity
                                        )
                                    }
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: loading
                                            ? "not-allowed"
                                            : "pointer"
                                    }}
                                />

                                <h2
                                    style={{
                                        margin: 0
                                    }}
                                >
                                    {entity}
                                </h2>

                                {isSelected && (
                                    <span
                                        style={{
                                            padding:
                                                "4px 10px",
                                            borderRadius:
                                                "15px",
                                            background:
                                                "#dbeafe",
                                            color:
                                                "#1d4ed8",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                "600"
                                        }}
                                    >
                                        Selected
                                    </span>
                                )}
                            </div>

                            {/* --------------------------------------------------
                                Source SQL
                            -------------------------------------------------- */}
                            <div
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >
                                <h3
                                    style={{
                                        marginBottom:
                                            "8px"
                                    }}
                                >
                                    Source Extraction SQL
                                </h3>

                                <pre
                                    style={{
                                        background:
                                            "#f7f7f7",
                                        padding: "15px",
                                        borderRadius:
                                            "6px",
                                        overflowX:
                                            "auto",
                                        whiteSpace:
                                            "pre-wrap",
                                        wordBreak:
                                            "break-word",
                                        border:
                                            "1px solid #e5e5e5",
                                        fontSize:
                                            "14px",
                                        lineHeight:
                                            "1.5"
                                    }}
                                >
                                    {sourceQuery}
                                </pre>
                            </div>

                            {/* --------------------------------------------------
                                Target SQL
                            -------------------------------------------------- */}
                            <div>
                                <h3
                                    style={{
                                        marginBottom:
                                            "8px"
                                    }}
                                >
                                    Target Insertion SQL
                                </h3>

                                <pre
                                    style={{
                                        background:
                                            "#f7f7f7",
                                        padding: "15px",
                                        borderRadius:
                                            "6px",
                                        overflowX:
                                            "auto",
                                        whiteSpace:
                                            "pre-wrap",
                                        wordBreak:
                                            "break-word",
                                        border:
                                            "1px solid #e5e5e5",
                                        fontSize:
                                            "14px",
                                        lineHeight:
                                            "1.5"
                                    }}
                                >
                                    {targetQuery}
                                </pre>
                            </div>
                        </div>
                    );
                }
            )}

            {/* --------------------------------------------------
                Error Message
            -------------------------------------------------- */}
            {error && (
                <div
                    style={{
                        padding: "15px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border:
                            "1px solid #fecaca"
                    }}
                >
                    <strong>Error:</strong>{" "}
                    {error}
                </div>
            )}

            {/* --------------------------------------------------
                Migration Status
            -------------------------------------------------- */}
            {migrationResults.length > 0 && (
                <div
                    style={{
                        marginTop: "30px",
                        padding: "20px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        background: "#fafafa"
                    }}
                >
                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom: "20px"
                        }}
                    >
                        Migration Status
                    </h2>

                    {migrationResults.map(
                        (result, index) => (
                            <div
                                key={`${result.entity}-${index}`}
                                style={{
                                    padding: "15px",
                                    marginBottom:
                                        "10px",
                                    borderRadius:
                                        "8px",
                                    background:
                                        result.success
                                            ? "#dcfce7"
                                            : "#fee2e2",
                                    color:
                                        result.success
                                            ? "#166534"
                                            : "#b91c1c",
                                    border:
                                        result.success
                                            ? "1px solid #bbf7d0"
                                            : "1px solid #fecaca"
                                }}
                            >
                                <strong>
                                    {result.success
                                        ? "✓ "
                                        : "✗ "}
                                    {result.entity}
                                </strong>

                                <div
                                    style={{
                                        marginTop:
                                            "5px"
                                    }}
                                >
                                    {
                                        result.message
                                    }
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* --------------------------------------------------
                Start Migration Button
            -------------------------------------------------- */}
            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent:
                        "flex-end",
                    gap: "15px"
                }}
            >
                <button
                    className="primary-button"
                    onClick={
                        handleStartMigration
                    }
                    disabled={
                        loading ||
                        selectedEntities.length ===
                            0
                    }
                    style={{
                        minWidth: "180px",
                        opacity:
                            loading ||
                            selectedEntities.length ===
                                0
                                ? 0.6
                                : 1,
                        cursor:
                            loading ||
                            selectedEntities.length ===
                                0
                                ? "not-allowed"
                                : "pointer"
                    }}
                >
                    {loading
                        ? "Migrating..."
                        : "Start Migration"}
                </button>
            </div>
        </div>
    );
}

export default QueryResults;