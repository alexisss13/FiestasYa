'use server';

export async function consultDni(dni: string) {
  // Asegúrate de tener esto en tu .env: RENIEC_API_TOKEN=tu_token_decolecta
  const token = process.env.RENIEC_API_TOKEN; 

  if (!token) {
    return { success: false, message: "Token de API no configurado", isLimitError: true };
  }

  try {
    // 🔌 Endpoint de Decolecta
    const response = await fetch(`https://api.decolecta.com/v1/reniec/dni?numero=${dni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    // 🚨 Manejo de Errores Críticos (Tokens agotados o error de servidor)
    if (!response.ok) {
        // Decolecta suele devolver 402 o 429 cuando se acaba el plan
        if (response.status === 402 || response.status === 429 || response.status === 401) {
            return { 
                success: false, 
                message: "⚠️ Límite de consultas agotado. Ingresa los datos manualmente.",
                isLimitError: true 
            };
        }
        return { success: false, message: "DNI no encontrado o servicio no disponible." };
    }

    const data = await response.json();

    // ✅ Mapeo de Decolecta a nuestra App
    return {
      success: true,
      data: {
        names: data.first_name, // Nombres
        fatherName: data.first_last_name, // Apellido Paterno
        motherName: data.second_last_name, // Apellido Materno
        // Decolecta a veces devuelve full_name, si no, lo armamos
        fullName: data.full_name || `${data.first_name} ${data.first_last_name} ${data.second_last_name}`
      }
    };

  } catch (error) {
    console.error("Error Decolecta:", error);
    return { 
        success: false, 
        message: "Error de conexión. Ingresa los datos manualmente.",
        isNetworkError: true // Esto activará el modo manual en el frontend
    };
  }
}