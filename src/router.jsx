import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Success from "./pages/Success";

function AppRouter() {
  return (
    <BrowserRouter basename="/register">
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
