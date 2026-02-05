Page({
  data: {
    wxid: "",
    path: "",
    focus: "",
    wsUrl: "",
    isConnected: false,
    socketTask: null,
  },

  onWxidInput: function (e) {
    this.setData({
      wxid: e.detail.value,
    });
  },

  onPathInput: function (e) {
    this.setData({
      path: e.detail.value,
    });
  },

  onWsUrlInput: function (e) {
    this.setData({
      wsUrl: e.detail.value,
    });
  },

  onFocus: function (e) {
    this.setData({
      focus: e.currentTarget.dataset.field,
    });
  },

  onBlur: function () {
    this.setData({
      focus: "",
    });
  },

  toggleConnection: function () {
    if (this.data.isConnected) {
      this.closeSocket();
    } else {
      this.connectSocket();
    }
  },

  connectSocket: function () {
    const that = this;
    let url = this.data.wsUrl;

    if (!url) {
      wx.showToast({ title: "请输入地址", icon: "error" });
      return;
    }

    if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
      url = "ws://" + url;
    }

    const task = wx.connectSocket({
      url: url,
      success: () => console.log("WebSocket connecting to " + url),
    });

    task.onOpen(() => {
      console.log("WebSocket connected");
      that.setData({ isConnected: true, socketTask: task });
      wx.showToast({ title: "已连接", icon: "success" });
      that.startHeartbeat();
    });

    task.onMessage((res) => {
      console.log("Received message:", res.data);
      that.handleSocketMessage(res.data);
    });

    task.onClose(() => {
      console.log("WebSocket closed");
      that.setData({ isConnected: false, socketTask: null });
      that.stopHeartbeat();
      wx.showToast({ title: "连接断开", icon: "error" });
    });

    task.onError((err) => {
      console.error("WebSocket error:", err);
      wx.showToast({ title: "连接错误", icon: "error" });
      that.setData({ isConnected: false, socketTask: null });
      that.stopHeartbeat();
    });
  },

  startHeartbeat: function () {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      const { socketTask, isConnected } = this.data;
      if (isConnected && socketTask) {
        socketTask.send({
          data: "ping",
          fail: () => {
            console.log("Heartbeat failed, closing connection");
            this.closeSocket();
          },
        });
      }
    }, 5000);
  },

  stopHeartbeat: function () {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  },

  closeSocket: function () {
    this.stopHeartbeat();
    if (this.data.socketTask) {
      this.data.socketTask.close();
    }
  },

  handleSocketMessage: function (msg) {
    try {
      if (msg === "pong") return; // Ignore pong responses
      // Parse message, assuming JSON format: {"appId": "...", "path": "..."}
      // If it's just a string, try to treat it as appId if plausible, or ignore
      let data = {};
      if (typeof msg === "string") {
        try {
          data = JSON.parse(msg);
        } catch (e) {
          // If not JSON, verify if it looks like an AppID? For now assume JSON required
          console.warn("Received non-JSON message, ignoring");
          return;
        }
      } else {
        data = msg;
      }

      if (data && data.appId) {
        this.setData({
          wxid: data.appId,
          path: data.path || "",
        });

        // Direct jump without confirmation
        this.jumpToMiniProgram();
      }
    } catch (err) {
      console.error("Message handling failed", err);
    }
  },

  jumpToMiniProgram: function () {
    const { wxid, path } = this.data;

    if (!wxid) {
      wx.showToast({
        title: "请输入 AppID",
        icon: "error",
      });
      return;
    }

    const options = {
      appId: wxid,
      success(res) {
        console.log("跳转成功", res);
      },
      fail(err) {
        console.error("跳转失败", err);
        wx.showModal({
          title: "跳转失败",
          content: err.errMsg || "未知错误",
          showCancel: false,
        });
      },
    };

    if (path) {
      options.path = path;
    }

    wx.navigateToMiniProgram(options);
  },

  onUnload: function () {
    this.stopHeartbeat();
    this.closeSocket();
  },
});
