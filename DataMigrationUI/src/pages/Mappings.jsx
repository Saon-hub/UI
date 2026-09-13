import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Mappings() {

    const location = useLocation();
    const navigate = useNavigate();

    const comparisonResult =
        location.state?.comparisonResult || [];

    const sourceSchema =
        location.state?.sourceSchema || "";

    const targetSchema =
        location.state?.targetSchema || "";

    const selectedEntities =
        location.state?.selectedEntities || [];

    const [selectedMappings, setSelectedMappings] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
     * Create a unique ID for every mapping.
     */

    const getMappingId = (
        entityIndex,
        mappingIndex
    ) => {

        return `${entityIndex}-${mappingIndex}`;

    };


    /*
     * Select / deselect individual mapping.
     */

    const toggleMapping = (mappingId) => {

        setSelectedMappings((current) => {

            if (current.includes(mappingId)) {

                return current.filter(
                    (id) => id !== mappingId
                );

            }

            return [
                ...current,
                mappingId
            ];

        });

    };


    /*
     * Get all mapping IDs.
     */

    const allMappingIds = [];

    comparisonResult.forEach(
        (entity, entityIndex) => {

            (entity.mappings || []).forEach(
                (_, mappingIndex) => {

                    allMappingIds.push(
                        getMappingId(
                            entityIndex,
                            mappingIndex
                        )
                    );

                }
            );

        }
    );


    const totalMappings =
        allMappingIds.length;


    /*
     * Select / deselect all mappings.
     */

    const selectAll = () => {

        if (
            selectedMappings.length ===
            totalMappings
        ) {

            setSelectedMappings([]);

        } else {

            setSelectedMappings(
                allMappingIds
            );

        }

    };


    /*
     * =========================================
     * CONTINUE
     *
     * Call query-builder once for every
     * selected entity.
     * =========================================
     */

    const handleContinue = async () => {

        if (selectedMappings.length === 0) {

            return;

        }

        setError("");
        setLoading(true);

        try {

            /*
             * Build selected mapping objects
             * grouped by entity.
             */

            const selectedMappingsByEntity = [];

            comparisonResult.forEach(
                (entity, entityIndex) => {

                    const entityMappings =
                        entity.mappings || [];

                    const selectedEntityMappings =
                        entityMappings.filter(
                            (_, mappingIndex) => {

                                const mappingId =
                                    getMappingId(
                                        entityIndex,
                                        mappingIndex
                                    );

                                return selectedMappings.includes(
                                    mappingId
                                );

                            }
                        );

                    /*
                     * Only call query-builder for
                     * entities that have at least
                     * one selected mapping.
                     */

                    if (
                        selectedEntityMappings.length > 0
                    ) {

                        selectedMappingsByEntity.push({
                            entity: entity.entity,
                            mappings:
                                selectedEntityMappings
                        });

                    }

                }
            );


            /*
             * =========================================
             * CALL QUERY BUILDER
             * =========================================
             */

            const queryResults = [];

            for (
                const mapping
                of selectedMappingsByEntity
            ) {

                const requestBody = {

                    mapping: {
                        entity: mapping.entity,

                        mappings:
                            mapping.mappings
                    },

                    sourceSchema:
                        sourceSchema,

                    targetSchema:
                        targetSchema

                };


                console.log(
                    `Query Builder Request - ${mapping.entity}:`,
                    requestBody
                );


                const response = await fetch(
                    "https://b7xiolvvbj.execute-api.us-east-1.amazonaws.com/prod/query-builder",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        `Query builder failed for ${mapping.entity}: ${response.status}`
                    );

                }


                const result =
                    await response.json();


                console.log(
                    `Query Builder Response - ${mapping.entity}:`,
                    result
                );


                /*
                 * Store result along with entity.
                 */

                queryResults.push(result);

            }


            /*
             * =========================================
             * GO TO NEXT PAGE
             * =========================================
             */

            navigate(
                "/query-results",
                {
                    state: {
                        queryResults,
                        selectedEntities,
                        sourceSchema,
                        targetSchema
                    }
                }
            );


        } catch (err) {

            console.error(
                "Query builder error:",
                err
            );

            setError(
                err.message ||
                "Failed to generate migration queries."
            );

        } finally {

            setLoading(false);

        }

    };


    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "35px 30px 110px",
                fontFamily:
                    "Arial, Helvetica, sans-serif",
                background: "#f4f6f8",
                minHeight: "100vh"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "flex-start",
                    marginBottom: "30px"
                }}
            >

                <div>

                    <h1
                        style={{
                            margin:
                                "0 0 8px",
                            fontSize:
                                "28px",
                            color:
                                "#111827"
                        }}
                    >
                        Migration Mappings
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color:
                                "#6b7280",
                            fontSize:
                                "16px"
                        }}
                    >
                        Select the mappings you want
                        to include in the migration.
                    </p>

                </div>


                <button
                    onClick={selectAll}
                    disabled={
                        totalMappings === 0 ||
                        loading
                    }
                    style={{
                        padding:
                            "11px 20px",
                        border: "none",
                        borderRadius:
                            "6px",
                        background:
                            "#e5e7eb",
                        color:
                            "#374151",
                        fontWeight:
                            "600",
                        cursor:
                            "pointer"
                    }}
                >

                    {
                        selectedMappings.length ===
                            totalMappings &&
                        totalMappings > 0
                            ? "Deselect All"
                            : "Select All"
                    }

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div
                    style={{
                        background:
                            "#fee2e2",
                        color:
                            "#b91c1c",
                        padding:
                            "12px 15px",
                        borderRadius:
                            "6px",
                        marginBottom:
                            "20px",
                        border:
                            "1px solid #fecaca"
                    }}
                >
                    {error}
                </div>

            )}


            {/* MAPPINGS */}

            {comparisonResult.length === 0 ? (

                <div
                    style={{
                        background:
                            "white",
                        padding:
                            "30px",
                        borderRadius:
                            "10px",
                        border:
                            "1px solid #e5e7eb"
                    }}
                >
                    No migration mappings were returned
                    by the schema comparison API.
                </div>

            ) : (

                comparisonResult.map(
                    (
                        entity,
                        entityIndex
                    ) => (

                        <div
                            key={
                                `${entity.entity}-${entityIndex}`
                            }
                            style={{
                                background:
                                    "white",
                                padding:
                                    "22px",
                                marginBottom:
                                    "25px",
                                borderRadius:
                                    "10px",
                                border:
                                    "1px solid #e5e7eb",
                                boxShadow:
                                    "0 2px 12px rgba(0,0,0,0.06)"
                            }}
                        >

                            <h2
                                style={{
                                    margin:
                                        "0 0 18px",
                                    fontSize:
                                        "20px",
                                    color:
                                        "#111827"
                                }}
                            >
                                {entity.entity}
                            </h2>


                            <div
                                style={{
                                    width:
                                        "100%",
                                    overflowX:
                                        "auto",
                                    border:
                                        "1px solid #d1d5db",
                                    borderRadius:
                                        "8px"
                                }}
                            >

                                <table
                                    style={{
                                        width:
                                            "100%",
                                        borderCollapse:
                                            "collapse",
                                        tableLayout:
                                            "fixed"
                                    }}
                                >

                                    <thead>

                                        <tr
                                            style={{
                                                background:
                                                    "#f1f5f9"
                                            }}
                                        >

                                            <th
                                                style={{
                                                    width:
                                                        "22%",
                                                    padding:
                                                        "14px 16px",
                                                    textAlign:
                                                        "left",
                                                    fontSize:
                                                        "13px",
                                                    borderBottom:
                                                        "1px solid #d1d5db"
                                                }}
                                            >
                                                SourceTableName
                                            </th>

                                            <th
                                                style={{
                                                    width:
                                                        "25%",
                                                    padding:
                                                        "14px 16px",
                                                    textAlign:
                                                        "left",
                                                    fontSize:
                                                        "13px",
                                                    borderBottom:
                                                        "1px solid #d1d5db"
                                                }}
                                            >
                                                SourceColumnName
                                            </th>

                                            <th
                                                style={{
                                                    width:
                                                        "22%",
                                                    padding:
                                                        "14px 16px",
                                                    textAlign:
                                                        "left",
                                                    fontSize:
                                                        "13px",
                                                    borderBottom:
                                                        "1px solid #d1d5db"
                                                }}
                                            >
                                                TargetTableName
                                            </th>

                                            <th
                                                style={{
                                                    width:
                                                        "25%",
                                                    padding:
                                                        "14px 16px",
                                                    textAlign:
                                                        "left",
                                                    fontSize:
                                                        "13px",
                                                    borderBottom:
                                                        "1px solid #d1d5db"
                                                }}
                                            >
                                                TargetColumnName
                                            </th>

                                            <th
                                                style={{
                                                    width:
                                                        "6%",
                                                    padding:
                                                        "14px 10px",
                                                    textAlign:
                                                        "center",
                                                    fontSize:
                                                        "13px",
                                                    borderBottom:
                                                        "1px solid #d1d5db"
                                                }}
                                            >
                                                Select
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {(entity.mappings || []).map(
                                            (
                                                mapping,
                                                mappingIndex
                                            ) => {

                                                const mappingId =
                                                    getMappingId(
                                                        entityIndex,
                                                        mappingIndex
                                                    );

                                                const isSelected =
                                                    selectedMappings.includes(
                                                        mappingId
                                                    );

                                                return (

                                                    <tr
                                                        key={
                                                            mappingId
                                                        }
                                                        style={{
                                                            background:
                                                                isSelected
                                                                    ? "#eff6ff"
                                                                    : "white"
                                                        }}
                                                    >

                                                        <td
                                                            style={{
                                                                padding:
                                                                    "15px 16px",
                                                                fontSize:
                                                                    "14px",
                                                                color:
                                                                    "#374151",
                                                                borderBottom:
                                                                    "1px solid #e5e7eb"
                                                            }}
                                                        >
                                                            {
                                                                mapping.Source_TableName
                                                            }
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    "15px 16px",
                                                                fontSize:
                                                                    "14px",
                                                                color:
                                                                    "#374151",
                                                                borderBottom:
                                                                    "1px solid #e5e7eb"
                                                            }}
                                                        >
                                                            {
                                                                mapping.Source_ColumnName
                                                            }
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    "15px 16px",
                                                                fontSize:
                                                                    "14px",
                                                                color:
                                                                    "#374151",
                                                                borderBottom:
                                                                    "1px solid #e5e7eb"
                                                            }}
                                                        >
                                                            {
                                                                mapping.Target_TableName
                                                            }
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    "15px 16px",
                                                                fontSize:
                                                                    "14px",
                                                                color:
                                                                    "#374151",
                                                                borderBottom:
                                                                    "1px solid #e5e7eb"
                                                            }}
                                                        >
                                                            {
                                                                mapping.Target_ColumnName
                                                            }
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    "15px 10px",
                                                                textAlign:
                                                                    "center",
                                                                borderBottom:
                                                                    "1px solid #e5e7eb"
                                                            }}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleMapping(
                                                                        mappingId
                                                                    )
                                                                }
                                                                style={{
                                                                    width:
                                                                        "17px",
                                                                    height:
                                                                        "17px",
                                                                    cursor:
                                                                        "pointer"
                                                                }}
                                                            />

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )
                )

            )}


            {/* FOOTER */}

            <div
                style={{
                    position:
                        "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height:
                        "70px",
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    padding:
                        "0 40px",
                    background:
                        "white",
                    borderTop:
                        "1px solid #d1d5db",
                    boxShadow:
                        "0 -3px 15px rgba(0,0,0,0.08)",
                    zIndex:
                        100
                }}
            >

                <span
                    style={{
                        fontSize:
                            "15px",
                        fontWeight:
                            "600",
                        color:
                            "#1f2937"
                    }}
                >
                    {selectedMappings.length}
                    {" "}
                    mappings selected
                </span>


                <button
                    onClick={handleContinue}
                    disabled={
                        selectedMappings.length === 0 ||
                        loading
                    }
                    style={{
                        padding:
                            "11px 25px",
                        border:
                            "none",
                        borderRadius:
                            "6px",
                        background:
                            selectedMappings.length === 0 ||
                            loading
                                ? "#9ca3af"
                                : "#2563eb",
                        color:
                            "white",
                        fontWeight:
                            "600",
                        cursor:
                            selectedMappings.length === 0 ||
                            loading
                                ? "not-allowed"
                                : "pointer"
                    }}
                >

                    {loading
                        ? "Generating Queries..."
                        : "Continue"}

                </button>

            </div>

        </div>
    );
}

export default Mappings;