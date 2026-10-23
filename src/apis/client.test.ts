import { client } from "@/apis/client";
import { MyHomeError } from "@/apis/errors";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/lib/authSession";
import { createSession } from "@/test/fixtures";
import { AxiosError, InternalAxiosRequestConfig } from "axios";

// 실제로 보내지 않고 정한 상태 코드로 응답한다. 보낸 요청 설정은 sent에 모은다.
// onSend는 응답 전에 실행한다(요청 중에 일어난 일을 흉내 낼 때).
function fakeServer(status: number, onSend?: () => void) {
  const sent: InternalAxiosRequestConfig[] = [];
  const adapter = async (config: InternalAxiosRequestConfig) => {
    sent.push(config);
    onSend?.();
    const response = { data: {}, status, statusText: "", headers: {}, config };
    if (status >= 400) {
      throw new AxiosError("fail", "ERR_BAD_REQUEST", config, null, response);
    }
    return response;
  };
  return { sent, adapter };
}

beforeEach(() => {
  clearAuthSession();
});

describe("client 인증", () => {
  it("로그인했으면 Bearer 토큰을 붙이고, 아니면 붙이지 않는다", async () => {
    const server = fakeServer(200);

    await client.get("/product", { adapter: server.adapter });
    saveAuthSession(createSession({ token: "abc" }));
    await client.get("/product", { adapter: server.adapter });

    expect(server.sent[0].headers.Authorization).toBeUndefined();
    expect(server.sent[1].headers.Authorization).toBe("Bearer abc");
  });

  it("만료된 세션의 토큰은 보내지 않고 로그아웃 처리한다", async () => {
    saveAuthSession(createSession({ expiresAt: "2000-01-01T00:00:00Z" }));
    const server = fakeServer(200);

    await client.get("/product", { adapter: server.adapter });

    expect(server.sent[0].headers.Authorization).toBeUndefined();
    expect(getAuthSession()).toBeNull();
  });

  it("지금 토큰을 서버가 거절하면(401) 로그아웃 처리하고 MyHomeError로 던진다", async () => {
    saveAuthSession(createSession());
    const server = fakeServer(401);

    await expect(
      client.put("/market", [], { adapter: server.adapter })
    ).rejects.toBeInstanceOf(MyHomeError);
    expect(getAuthSession()).toBeNull();
  });

  it("관리자가 아니라서 거절되면(403) 로그인은 유지한다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    const server = fakeServer(403);

    await expect(
      client.put("/market", [], { adapter: server.adapter })
    ).rejects.toMatchObject({ status: 403 });
    expect(getAuthSession()).not.toBeNull();
  });

  it("요청 중에 다시 로그인했으면 이전 토큰의 401로 새 세션을 지우지 않는다", async () => {
    saveAuthSession(createSession({ token: "old" }));
    const newer = createSession({ token: "new" });
    const server = fakeServer(401, () => saveAuthSession(newer));

    await expect(
      client.put("/market", [], { adapter: server.adapter })
    ).rejects.toBeInstanceOf(MyHomeError);
    expect(getAuthSession()).toBe(newer);
  });
});
