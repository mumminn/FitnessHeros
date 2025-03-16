import "./index.css";
import { RouterProvider } from "react-router-dom";
import { PopupProvider } from "./contexts/PopupContext";
import PopupDisplay from "./components/PopupDisplay";
import router from "./routes/routing";
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  return (
    <PopupProvider>
      <SocketProvider>
        <RouterProvider router={router} />
        <PopupDisplay /> {/* 항상 렌더링되는 전역 팝업 */}
      </SocketProvider>
    </PopupProvider>
  );
}

export default App;
