const responseBox = document.getElementById("responseBox");

function getCredentials() {
  const idInstance = document.getElementById("idInstance").value.trim();
  const apiTokenInstance = document.getElementById("apiTokenInstance").value.trim();

  if (!idInstance || !apiTokenInstance) {
    throw new Error("Заполните idInstance и ApiTokenInstance");
  }

  return { idInstance, apiTokenInstance };
}

function buildUrl(method, idInstance, apiTokenInstance) {
  return `https://api.green-api.com/waInstance${idInstance}/${method}/${apiTokenInstance}`;
}

function printResponse(title, data) {
  const stamp = new Date().toLocaleString("ru-RU");
  responseBox.value = `[${stamp}] ${title}\n${JSON.stringify(data, null, 2)}`;
}

function printError(method, error) {
  const message = error?.message || "Неизвестная ошибка";
  printResponse(`${method}: error`, { message });
}

function resolveFileName(urlFile, fileName) {
  if (fileName) {
    return fileName;
  }

  try {
    const parsedUrl = new URL(urlFile);
    const fromPath = decodeURIComponent(parsedUrl.pathname.split("/").pop() || "");
    return fromPath || "file";
  } catch {
    return "file";
  }
}

async function callGreenApi(method, payload) {
  const { idInstance, apiTokenInstance } = getCredentials();
  const url = buildUrl(method, idInstance, apiTokenInstance);

  const options = payload
    ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    : { method: "GET" };

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }
  return data;
}

document.getElementById("getSettingsBtn").addEventListener("click", async () => {
  try {
    const result = await callGreenApi("getSettings");
    printResponse("getSettings", result);
  } catch (error) {
    printError("getSettings", error);
  }
});

document.getElementById("getStateInstanceBtn").addEventListener("click", async () => {
  try {
    const result = await callGreenApi("getStateInstance");
    printResponse("getStateInstance", result);
  } catch (error) {
    printError("getStateInstance", error);
  }
});

document.getElementById("sendMessageBtn").addEventListener("click", async () => {
  try {
    const chatId = document.getElementById("chatId").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!chatId || !message) {
      throw new Error("Для sendMessage заполните chatId и текст сообщения");
    }
    const result = await callGreenApi("sendMessage", { chatId, message });
    printResponse("sendMessage", result);
  } catch (error) {
    printError("sendMessage", error);
  }
});

document.getElementById("sendFileByUrlBtn").addEventListener("click", async () => {
  try {
    const chatId = document.getElementById("fileChatId").value.trim();
    const urlFile = document.getElementById("fileUrl").value.trim();
    const fileName = document.getElementById("fileName").value.trim();
    if (!chatId || !urlFile) {
      throw new Error("Для sendFileByUrl заполните chatId и URL файла");
    }
    const resolvedFileName = resolveFileName(urlFile, fileName);
    const result = await callGreenApi("sendFileByUrl", {
      chatId,
      urlFile,
      fileName: resolvedFileName,
    });
    printResponse("sendFileByUrl", result);
  } catch (error) {
    printError("sendFileByUrl", error);
  }
});
