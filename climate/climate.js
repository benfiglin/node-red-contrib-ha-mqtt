const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-climate', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    // 更新状态
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // 更新属性
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { state_topic, availability_topic, mode_command_topic, temperature_command_topic } = ha.config
            // 订阅主题
            ha.subscribe(temperature_command_topic, (payload) => {
                node.send([{ payload }, null])
            })
            ha.subscribe(mode_command_topic, (payload) => {
                node.send([null, { payload }])
            })

            ha.discovery({
                state_topic: null,
                "mode_cmd_t": mode_command_topic,
                "mode_stat_t": state_topic,
                "mode_stat_tpl": "",
                "avty_t": availability_topic,
                "pl_avail": "online",
                "pl_not_avail": "offline",
                "temp_cmd_t": temperature_command_topic,
                "temp_stat_t": state_topic,
                "temp_stat_tpl": "",
                "curr_temp_t": state_topic,
                "curr_temp_tpl": "",
                "min_temp": "15",
                "max_temp": "25",
                "temp_step": "0.5",
                "modes": ["off", "heat"]
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}