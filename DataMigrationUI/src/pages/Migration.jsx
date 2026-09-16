import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Migration() {

    const navigate = useNavigate();

    const [sourceSchema, setSourceSchema] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInitiateMigration = async () => {

        if (!sourceSchema.trim()) {
            setError("Please enter the source database schema.");
            return;
        }

        setError("");
        setLoading(true);

        try {

            /*
             * IMPORTANT:
             * The Schema Analysis API expects "Schema"
             * as the request property.
             */
            const requestBody = {
                Schema: sourceSchema.trim()
            };

            console.log(
                "Schema Analysis Request:",
                requestBody
            );

            const response = await fetch(
                "https://b7xiolvvbj.execute-api.us-east-1.amazonaws.com/prod/schema-analysis",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(requestBody)
                }
            );

            const result = await response.json();

            console.log(
                "Schema Analysis Response:",
                result
            );

            /*
             * Handle HTTP/API errors
             */
            if (!response.ok) {

                let errorMessage =
                    "Schema analysis failed.";

                /*
                 * Lambda response may contain
                 * the actual error inside body.
                 */
                if (result?.body) {

                    try {

                        const errorBody =
                            typeof result.body === "string"
                                ? JSON.parse(result.body)
                                : result.body;

                        if (errorBody?.error) {
                            errorMessage =
                                errorBody.error;
                        }

                    } catch (parseError) {

                        console.error(
                            "Error parsing API error body:",
                            parseError
                        );

                    }

                } else if (result?.error) {

                    errorMessage =
                        result.error;
                }

                throw new Error(
                    errorMessage
                );
            }

            /*
             * Pass complete API response
             * to Results page.
             */
            navigate(
                "/results",
                {
                    state: {
                        analysisResult: result,
                        sourceSchema: sourceSchema
                    }
                }
            );

        } catch (err) {

            console.error(
                "Schema analysis error:",
                err
            );

            setError(
                err.message ||
                "Failed to analyze schema."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="page">

            <div className="page-header">

                <h1>
                    Initiate Migration
                </h1>

                <p>
                    Start a new data migration by analyzing
                    your source database schema.
                </p>

            </div>

            <div className="migration-card">

                <h2>
                    Source Schema
                </h2>

                <p>
                    Provide the source database schema
                    for analysis.
                </p>

                <textarea
                    rows="15"
                    placeholder="Enter source database schema here..."
                    value={sourceSchema}
                    onChange={(event) =>
                        setSourceSchema(
                            event.target.value
                        )
                    }
                />

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="button-container">

                    <button
                        className="primary-button"
                        onClick={
                            handleInitiateMigration
                        }
                        disabled={loading}
                    >

                        {loading
                            ? "Analyzing Schema..."
                            : "Initiate Migration"}

                    </button>

                </div>

            </div>

        </div>
    );
}

export default Migration;