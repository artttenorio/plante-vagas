import { authFetch, BASE_URL, getUserId } from "./api";

const USERS_URL = `${BASE_URL}/users`;

export async function updateUser(data: {
  phone?: string;
  disablePerson?: string;
  gender?: string;
  currentPassword?: string;
  newPassword?: string;
  address?: {
    postalCode: string;
    street: string;
    number: string;
    district: string;
    complement?: string;
    city: string;
    state?: string;
    country?: string;
  };
}) {
  const response = await authFetch(`${USERS_URL}/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao atualizar dados");
  }
  return response.json();
}

export async function uploadUserPhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await authFetch(`${USERS_URL}/photo`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao enviar foto");
  }
  return response.json();
}

export async function deleteUser() {
  const userId = getUserId();
  const response = await authFetch(`${USERS_URL}/delete/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao deletar conta");
  }
  return response.json();
}
