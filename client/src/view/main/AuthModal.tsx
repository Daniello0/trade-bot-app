import React from "react";
import Modal from "react-modal";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../service/Firebase";
import "./AuthModal.css";
import {loginUser, logoutUser} from "../../service/UserAuthService";
import {ReadUser} from "../../api/Types";

Modal.setAppElement('#root');

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: ReadUser | undefined;
    onAuthUpdate: () => Promise<void>
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user, onAuthUpdate }) => {
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token: string = await result.user.getIdToken();

            const res: number | undefined = await loginUser(token);
            console.log(res);

            await onAuthUpdate();

            console.log("Вход выполнен успешно");
            onClose();
        } catch (error) {
            console.error("Ошибка при входе через Google:", error);
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            await logoutUser();

            await onAuthUpdate()

            console.log(`Выход выполнен успешно`);
            onClose();
        } catch (error) {
            console.error(`Ошибка при выходе:`, error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Аутентификация"
            className="modal"
            overlayClassName="overlay"
        >
            <div className="modal-content">
                <h2>Аутентификация</h2>

                {user ? (
                    <div className="auth-status">
                        <p>Вы вошли в систему ({user.email})</p>
                        <button onClick={logout} className="logout-btn">Выйти</button>
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Войти с помощью</label>
                        <button onClick={loginWithGoogle} className="google-btn">
                            Google
                        </button>
                    </div>
                )}

                <button onClick={onClose} className="close-modal-btn">Закрыть</button>
            </div>
        </Modal>
    );
};