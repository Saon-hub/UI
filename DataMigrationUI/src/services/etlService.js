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

    console.log(
        `[ETL] Starting migration for ${entity}`
    );

    const response = await fetch(
        ETL_AGENT_URL,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify(requestBody)
        }
    );

    const responseText =
        await response.text();

    console.log(
        `[ETL] Raw response for ${entity}:`,
        responseText
    );

    // ------------------------------------------
    // Parse API Gateway response
    // ------------------------------------------

    let apiResponse;

    try {
        apiResponse =
            JSON.parse(responseText);
    } catch {
        return {
            success: false,
            entity,
            extractedRows: 0,
            insertedRows: 0,
            message: "Migration failed.",
            error:
                "Unable to parse ETL Agent response.",
            statusCode: response.status
        };
    }

    // ------------------------------------------
    // Parse the BODY
    // ------------------------------------------
    // apiResponse.body is a JSON STRING
    //
    // Example:
    // "{\"success\":false,...}"
    //
    // So we must JSON.parse() it again.
    // ------------------------------------------

    let migrationResponse;

    try {
        migrationResponse =
            typeof apiResponse.body ===
            "string"
                ? JSON.parse(
                      apiResponse.body
                  )
                : apiResponse.body;
    } catch {
        return {
            success: false,
            entity,
            extractedRows: 0,
            insertedRows: 0,
            message: "Migration failed.",
            error:
                "Unable to parse ETL Agent response body.",
            statusCode:
                apiResponse.statusCode ||
                response.status
        };
    }

    console.log(
        `[ETL] Parsed body for ${entity}:`,
        migrationResponse
    );

    // ------------------------------------------
    // Get results[0]
    // ------------------------------------------

    const entityResult =
        migrationResponse?.results?.[0];

    if (!entityResult) {
        return {
            success: false,
            entity,
            extractedRows: 0,
            insertedRows: 0,
            message: "Migration failed.",
            error:
                "No migration result returned by ETL Agent.",
            statusCode:
                apiResponse.statusCode ||
                response.status
        };
    }

    // ------------------------------------------
    // IMPORTANT:
    //
    // Failure reason comes from:
    //
    // body -> results[0] -> error
    // ------------------------------------------

    const success =
        entityResult.success === true;

    const message =
        entityResult.message ||
        "Migration completed.";

    const failureReason =
        entityResult.error || "";

    console.log(
        `[ETL] Entity: ${entityResult.entity}`
    );

    console.log(
        `[ETL] Success: ${success}`
    );

    console.log(
        `[ETL] Extracted Rows: ${entityResult.extractedRows}`
    );

    console.log(
        `[ETL] Inserted Rows: ${entityResult.insertedRows}`
    );

    console.log(
        `[ETL] Message: ${message}`
    );

    console.log(
        `[ETL] Failure Reason: ${failureReason}`
    );

    // ------------------------------------------
    // Return result to QueryResults.jsx
    // ------------------------------------------

    return {
        success,

        entity:
            entityResult.entity ||
            entity,

        extractedRows:
            entityResult.extractedRows || 0,

        insertedRows:
            entityResult.insertedRows || 0,

        message,

        error: failureReason,

        statusCode:
            apiResponse.statusCode ||
            response.status,

        totalEntities:
            migrationResponse.totalEntities || 0,

        successfulEntities:
            migrationResponse.successfulEntities ||
            0,

        failedEntities:
            migrationResponse.failedEntities ||
            0
    };
}