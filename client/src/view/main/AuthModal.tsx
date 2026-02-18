import React, { useState } from "react";
import Modal from "react-modal";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../service/Firebase";
import "./AuthModal.css";
import {loginUser, logoutUser} from "../../service/UserAuthService";

Modal.setAppElement('#root');

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [idToken, setIdToken] = useState<string | null>(null);

    const isLoggedIn = !!idToken;

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token: string = await result.user.getIdToken();

            setIdToken(token);

            const res: number | undefined = await loginUser(token);
            console.log(res);

            console.log("Вход выполнен успешно");
            onClose();
        } catch (error) {
            console.error("Ошибка при входе через Google:", error);
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setIdToken(null);
            await logoutUser();
        } catch (error) {
            console.error("Ошибка при выходе:", error);
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

                {isLoggedIn ? (
                    <div className="auth-status">
                        <p>Вы вошли в систему</p>
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