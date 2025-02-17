module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-discovery', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const node = this
            node.on('input', function (msg) {
                node.server.client.publish('homeassistant/status', 'online')
                this.status({ fill: "green", shape: "ring", text: `${new Date().toLocaleTimeString()} 发现设备` });
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}