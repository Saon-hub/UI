import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Results() {

    const navigate = useNavigate();

    const entities = [
        {
            name: "Customer",
            description: "Customer master information"
        },
        {
            name: "Order",
            description: "Customer order information"
        },
        {
            name: "Product",
            description: "Product catalog information"
        },
        {
            name: "Address",
            description: "Customer address information"
        }
    ];

    const [selectedEntities, setSelectedEntities] = useState([]);

    const toggleEntity = (entityName) => {

        setSelectedEntities((current) => {

            if (current.includes(entityName)) {

                return current.filter(
                    (name) => name !== entityName
                );

            }

            return [...current, entityName];

        });
    };

    const selectAll = () => {

        if (selectedEntities.length === entities.length) {

            setSelectedEntities([]);

        } else {

            setSelectedEntities(
                entities.map((entity) => entity.name)
            );

        }
    };

    const handleContinue = () => {

        if (selectedEntities.length === 0) {
            return;
        }

        navigate("/schema-comparison", {
            state: {
                selectedEntities
            }
        });
    };

    return (
        <div className="page">

            <div className="page-header">

                <h1>Schema Analysis Result</h1>

                <p>
                    Review the entities identified from
                    the source schema.
                </p>

            </div>

            <div className="summary-card">

                <h2>Analysis Summary</h2>

                <div className="summary-grid">

                    <div>
                        <span>
                            Tables Analyzed
                        </span>

                        <strong>
                            4
                        </strong>
                    </div>

                    <div>
                        <span>
                            Entities Identified
                        </span>

                        <strong>
                            {entities.length}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Recommended
                        </span>

                        <strong>
                            3
                        </strong>
                    </div>

                    <div>
                        <span>
                            Selected
                        </span>

                        <strong>
                            {selectedEntities.length}
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
                            Choose the entities you want
                            to migrate.
                        </p>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={selectAll}
                    >
                        {selectedEntities.length === entities.length
                            ? "Deselect All"
                            : "Select All"}
                    </button>

                </div>

                <div className="entity-list">

                    {entities.map((entity) => (

                        <label
                            className="entity-row"
                            key={entity.name}
                        >

                            <input
                                type="checkbox"
                                checked={selectedEntities.includes(
                                    entity.name
                                )}
                                onChange={() =>
                                    toggleEntity(entity.name)
                                }
                            />

                            <div>

                                <strong>
                                    {entity.name}
                                </strong>

                                <p>
                                    {entity.description}
                                </p>

                            </div>

                        </label>

                    ))}

                </div>

                <div className="selection-footer">

                    <span>
                        {selectedEntities.length} entities selected
                    </span>

                    <button
                        className="primary-button"
                        disabled={
                            selectedEntities.length === 0
                        }
                        onClick={handleContinue}
                    >
                        Continue
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Results;