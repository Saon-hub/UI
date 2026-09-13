import { useLocation } from "react-router-dom";

function QueryResults() {

    const location = useLocation();

    const queryResults =
        location.state?.queryResults || [];

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "35px 30px 50px",
                fontFamily:
                    "Arial, Helvetica, sans-serif",
                background: "#f4f6f8",
                minHeight: "100vh"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    marginBottom: "30px"
                }}
            >

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
                    Migration Queries
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
                    Generated source extraction and target
                    insertion queries for the selected mappings.
                </p>

            </div>


            {/* RESULTS */}

            {queryResults.length === 0 ? (

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
                    No query results were returned.
                </div>

            ) : (

                queryResults.map(
                    (result, index) => (

                        <div
                            key={index}
                            style={{
                                background:
                                    "white",
                                padding:
                                    "25px",
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

                            {/* ENTITY */}

                            <h2
                                style={{
                                    margin:
                                        "0 0 25px",
                                    fontSize:
                                        "20px",
                                    color:
                                        "#111827"
                                }}
                            >
                                {result.Entity ||
                                 result.entity ||
                                 "Entity"}
                            </h2>


                            {/* SOURCE QUERY */}

                            <div
                                style={{
                                    marginBottom:
                                        "25px"
                                }}
                            >

                                <h3
                                    style={{
                                        margin:
                                            "0 0 10px",
                                        fontSize:
                                            "16px",
                                        color:
                                            "#374151"
                                    }}
                                >
                                    Source Extraction Query
                                </h3>

                                <pre
                                    style={{
                                        margin: 0,
                                        padding:
                                            "18px",
                                        background:
                                            "#f8fafc",
                                        border:
                                            "1px solid #e5e7eb",
                                        borderRadius:
                                            "8px",
                                        overflowX:
                                            "auto",
                                        whiteSpace:
                                            "pre-wrap",
                                        wordBreak:
                                            "break-word",
                                        fontSize:
                                            "14px",
                                        lineHeight:
                                            "1.6",
                                        color:
                                            "#1f2937"
                                    }}
                                >
                                    {
                                        result.SourceExtractionQuery ||
                                        result.sourceExtractionQuery ||
                                        ""
                                    }
                                </pre>

                            </div>


                            {/* TARGET QUERY */}

                            <div>

                                <h3
                                    style={{
                                        margin:
                                            "0 0 10px",
                                        fontSize:
                                            "16px",
                                        color:
                                            "#374151"
                                    }}
                                >
                                    Target Insertion Query
                                </h3>

                                <pre
                                    style={{
                                        margin: 0,
                                        padding:
                                            "18px",
                                        background:
                                            "#f8fafc",
                                        border:
                                            "1px solid #e5e7eb",
                                        borderRadius:
                                            "8px",
                                        overflowX:
                                            "auto",
                                        whiteSpace:
                                            "pre-wrap",
                                        wordBreak:
                                            "break-word",
                                        fontSize:
                                            "14px",
                                        lineHeight:
                                            "1.6",
                                        color:
                                            "#1f2937"
                                    }}
                                >
                                    {
                                        result.TargetInsertionQuery ||
                                        result.targetInsertionQuery ||
                                        ""
                                    }
                                </pre>

                            </div>

                        </div>

                    )
                )

            )}

        </div>
    );
}

export default QueryResults;