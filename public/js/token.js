async function refreshToken() {
  try {
    const response = await axios.post("/user/refresh-token", {}, { withCredentials: true });
    console.log("Access Token refreshed:", response.data.accessToken);
  } catch (error) {
    console.error("Không thể làm mới Access Token", error);
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      window.location.href = "/user/login"; // Chuyển về trang đăng nhập nếu refresh thất bại
    }
  }
}

function checkTokenExpiration() {
  const accessToken = document.cookie.split("; ").find(row => row.startsWith("accessToken="));
  if (!accessToken) {
    console.log("Access Token không tồn tại, thực hiện refresh...");
    refreshToken();
  }
}

setInterval(checkTokenExpiration, 10 * 60 * 1000); // Kiểm tra mỗi 10 phút