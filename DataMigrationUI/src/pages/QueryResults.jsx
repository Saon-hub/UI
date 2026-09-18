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

    const [migrationStartTime, setMigrationStartTime] =
        useState("");

    const [migrationEndTime, setMigrationEndTime] =
        useState("");

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
    // Get Source Query
    // --------------------------------------------------
    const getSourceQuery = (result) => {
        return (
            result.SourceExtractionQuery ||
            result.sourceExtractionQuery ||
            ""
        );
    };

    // --------------------------------------------------
    // Get Target Query
    // --------------------------------------------------
    const getTargetQuery = (result) => {
        return (
            result.TargetInsertionQuery ||
            result.targetInsertionQuery ||
            ""
        );
    };

    // --------------------------------------------------
    // Format Date / Time
    // --------------------------------------------------
    const formatDateTime = (date) => {
        if (!date) {
            return "";
        }

        return date.toLocaleString();
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

        setMigrationResults([]);
        setMigrationStartTime("");
        setMigrationEndTime("");
        setError("");
    };

    // --------------------------------------------------
    // Select All
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
        setMigrationStartTime("");
        setMigrationEndTime("");
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

        // ----------------------------------------------
        // Migration Start Time
        // ----------------------------------------------
        const startTime = new Date();

        setMigrationStartTime(
            formatDateTime(startTime)
        );

        const results = [];

        try {
            // Process one entity at a time
            for (
                const entityName of selectedEntities
            ) {
                const queryResult =
                    queryResults.find(
                        (result) =>
                            getEntityName(
                                result
                            ) === entityName
                    );

                // ------------------------------------------
                // Query not found
                // ------------------------------------------
                if (!queryResult) {
                    results.push({
                        entity: entityName,
                        success: false,
                        message:
                            "Migration failed.",
                        error:
                            "Migration query was not found.",
                        extractedRows: 0,
                        insertedRows: 0
                    });

                    setMigrationResults([
                        ...results
                    ]);

                    continue;
                }

                try {
                    console.log(
                        `[Migration] Starting entity: ${entityName}`
                    );

                    // --------------------------------------
                    // Call ETL Agent
                    // --------------------------------------
                    const etlResult =
                        await runETL(
                            getEntityName(
                                queryResult
                            ),
                            getSourceQuery(
                                queryResult
                            ),
                            getTargetQuery(
                                queryResult
                            )
                        );

                    console.log(
                        `[Migration] Result for ${entityName}:`,
                        etlResult
                    );

                    // --------------------------------------
                    // Store actual ETL result
                    // --------------------------------------
                    results.push({
                        entity:
                            etlResult.entity ||
                            entityName,

                        success:
                            etlResult.success ===
                            true,

                        message:
                            etlResult.message ||
                            (
                                etlResult.success
                                    ? "Migration completed successfully."
                                    : "Migration failed."
                            ),

                        error:
                            etlResult.error ||
                            "",

                        extractedRows:
                            etlResult.extractedRows ??
                            0,

                        insertedRows:
                            etlResult.insertedRows ??
                            0,

                        statusCode:
                            etlResult.statusCode,

                        totalEntities:
                            etlResult.totalEntities,

                        successfulEntities:
                            etlResult.successfulEntities,

                        failedEntities:
                            etlResult.failedEntities
                    });
                } catch (err) {
                    console.error(
                        `[Migration] Exception for ${entityName}:`,
                        err
                    );

                    results.push({
                        entity: entityName,
                        success: false,
                        message:
                            "Migration failed.",
                        error:
                            err.message ||
                            "Unexpected error occurred while executing migration.",
                        extractedRows: 0,
                        insertedRows: 0
                    });
                }

                // ------------------------------------------
                // Update UI after every entity
                // ------------------------------------------
                setMigrationResults([
                    ...results
                ]);
            }
        } catch (err) {
            console.error(
                "[Migration] Migration execution error:",
                err
            );

            setError(
                err.message ||
                    "Migration execution failed."
            );
        } finally {
            // ----------------------------------------------
            // Migration End Time
            // ----------------------------------------------
            const endTime = new Date();

            setMigrationEndTime(
                formatDateTime(endTime)
            );

            setLoading(false);
        }
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
            {/* ==================================================
                PAGE HEADER
            ================================================== */}

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

            {/* ==================================================
                SELECT ALL
            ================================================== */}

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
                        height: "18px"
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

            {/* ==================================================
                QUERY RESULTS
            ================================================== */}

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
                            {/* Entity */}
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
                                        height: "18px"
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

                            {/* Source SQL */}
                            <div
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >
                                <h3>
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

                            {/* Target SQL */}
                            <div>
                                <h3>
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

            {/* ==================================================
                ERROR
            ================================================== */}

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

            {/* ==================================================
                MIGRATION LOG
            ================================================== */}

            {migrationResults.length > 0 && (
                <div
                    style={{
                        marginTop: "30px",
                        padding: "25px",
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

                    {/* ------------------------------------------
                        Migration Start
                    ------------------------------------------ */}

                    {migrationStartTime && (
                        <div
                            style={{
                                padding: "15px",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                background:
                                    "#eef2ff",
                                border:
                                    "1px solid #c7d2fe",
                                color: "#3730a3"
                            }}
                        >
                            <strong>
                                Migration Started
                            </strong>

                            <div
                                style={{
                                    marginTop:
                                        "5px"
                                }}
                            >
                                Migration started on{" "}
                                <strong>
                                    {
                                        migrationStartTime
                                    }
                                </strong>
                            </div>
                        </div>
                    )}

                    {/* ------------------------------------------
                        Entity Results
                    ------------------------------------------ */}

                    {migrationResults.map(
                        (result, index) => (
                            <div
                                key={`${result.entity}-${index}`}
                                style={{
                                    padding: "18px",
                                    marginBottom:
                                        "12px",
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
                                {/* Entity Status */}
                                <div
                                    style={{
                                        fontSize:
                                            "16px",
                                        fontWeight:
                                            "600"
                                    }}
                                >
                                    {result.success
                                        ? "✓"
                                        : "✗"}{" "}
                                    {result.entity}
                                </div>

                                {/* Message */}
                                <div
                                    style={{
                                        marginTop:
                                            "8px"
                                    }}
                                >
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {result.success
                                        ? "Migration completed successfully."
                                        : "Migration failed."}
                                </div>

                                {/* Extracted Rows */}
                                <div
                                    style={{
                                        marginTop:
                                            "6px"
                                    }}
                                >
                                    <strong>
                                        Records Extracted:
                                    </strong>{" "}
                                    {
                                        result.extractedRows
                                    }
                                </div>

                                {/* Inserted Rows */}
                                <div
                                    style={{
                                        marginTop:
                                            "4px"
                                    }}
                                >
                                    <strong>
                                        Records Inserted:
                                    </strong>{" "}
                                    {
                                        result.insertedRows
                                    }
                                </div>

                                {/* Migration Message */}
<div
    style={{
        marginTop: "8px"
    }}
>
    <strong>
        Message:
    </strong>{" "}
    {result.message}
</div>

{/* Failure Reason */}
{!result.success && (
    <div
        style={{
            marginTop: "12px",
            padding: "12px",
            borderRadius: "6px",
            background: "#fff",
            border: "1px solid #fca5a5"
        }}
    >
        <strong>
            Failure Reason:
        </strong>

        <div
            style={{
                marginTop: "6px",
                lineHeight: "1.5",
                wordBreak: "break-word"
            }}
        >
            {result.error ||
                "No failure reason was returned by the ETL Agent."}
        </div>
    </div>
)}
                            </div>
                        )
                    )}

                    {/* ------------------------------------------
                        Migration End
                    ------------------------------------------ */}

                    {migrationEndTime && (
                        <div
                            style={{
                                padding: "15px",
                                marginTop: "10px",
                                borderRadius: "8px",
                                background:
                                    "#f0fdf4",
                                border:
                                    "1px solid #bbf7d0",
                                color: "#166534"
                            }}
                        >
                            <strong>
                                Migration Completed
                            </strong>

                            <div
                                style={{
                                    marginTop:
                                        "5px"
                                }}
                            >
                                Migration ended on{" "}
                                <strong>
                                    {
                                        migrationEndTime
                                    }
                                </strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================================================
                START MIGRATION
            ================================================== */}

            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent:
                        "flex-end"
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