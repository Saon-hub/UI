const ETL_AGENT_URL =
    "https://b7xiolvvbj.execute-api.us-east-1.amazonaws.com/prod/etl-agent";

export async function runETL(
    entity,
    sourceExtractionQuery,
    targetInsertionQuery
) {
    const etlInput = {
        Entity: entity,
        SourceExtractionQuery:
            sourceExtractionQuery,
        TargetInsertionQuery:
            targetInsertionQuery
    };

    const requestBody = {
        body: JSON.stringify([etlInput]),
        httpMethod: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        isBase64Encoded: false
    };

    const response = await fetch(
        ETL_AGENT_URL,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify(
                requestBody
            )
        }
    );

    const responseText =
        await response.text();

    let responseData;

    try {
        responseData = responseText
            ? JSON.parse(responseText)
            : null;
    } catch {
        responseData = responseText;
    }

    if (!response.ok) {
        throw new Error(
            typeof responseData === "string"
                ? responseData
                : `ETL Agent failed with status ${response.status}`
        );
    }

    return responseData;
}