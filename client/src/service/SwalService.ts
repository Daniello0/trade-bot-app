import Swal from 'sweetalert2';
import { UserKeys } from "../api/Types";
import { getUserKeys } from "./UserService"; // Предполагаем, что эта функция возвращает Promise<UserKeys | undefined>

export const openApiKeysModal = async (): Promise<UserKeys | undefined> => {

    let existingKeys: UserKeys | undefined;
    try {
        existingKeys = await getUserKeys();
    } catch (error) {
        console.error("Failed to fetch existing API keys:", error);
        Swal.fire('Ошибка', 'Не удалось загрузить текущие ключи.', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Настройки API ключей',
        html:
            '<input id="swal-input-apikey" class="swal2-input" placeholder="API Key">' +
            '<input id="swal-input-secret" type="password" class="swal2-input" placeholder="Secret Key">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Сохранить',
        cancelButtonText: 'Отмена',

        didOpen: () => {
            const apiKeyInput = document.getElementById('swal-input-apikey') as HTMLInputElement;
            const secretKeyInput = document.getElementById('swal-input-secret') as HTMLInputElement;

            if (existingKeys) {
                apiKeyInput.value = existingKeys.api_key || '';

                if (existingKeys.api_secret) {
                    secretKeyInput.placeholder = '******** (уже сохранен)';
                }
            }
        },

        preConfirm: () => {
            const apiKey = (document.getElementById('swal-input-apikey') as HTMLInputElement).value;
            const secretKey = (document.getElementById('swal-input-secret') as HTMLInputElement).value;

            return {
                api_key: apiKey,
                api_secret: secretKey
            }
        }
    });

    if (formValues) {
        if (!formValues.api_key && !formValues.api_secret) {
            Swal.fire('Отменено', 'Вы не ввели новые ключи.', 'info');
            return;
        }

        console.log('Отправляем на сервер:', formValues);
        Swal.fire('Успех', 'Ключи зашифрованы и сохранены', 'success');
        return formValues; // Возвращаем новые значения
    }
};