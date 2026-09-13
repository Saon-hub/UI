import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Migration from "./pages/Migration";
import Results from "./pages/Results";
import SchemaComparison from "./pages/SchemaComparison";
import Mappings from "./pages/Mappings";
import QueryResults from "./pages/QueryResults";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/migration"
                    element={<Migration />}
                />

                <Route
                    path="/results"
                    element={<Results />}
                />

                <Route
                    path="/schema-comparison"
                    element={<SchemaComparison />}
                />

                <Route
                    path="/mappings"
                    element={<Mappings />}
                />

                <Route
                    path="/query-results"
                    element={<QueryResults />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;