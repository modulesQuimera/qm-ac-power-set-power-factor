module.exports = function(RED) {

    var mapeamentoNode;

    function set_power_factorNode(config) {
        RED.nodes.createNode(this, config);
        this.mapeamento = config.mapeamento;
        this.type_mode = config.type_mode;
        this.pf_select = config.pf_select;
        this.PFA_value = config.PFA_value;
        this.PFB_value = config.PFB_value;
        this.PFC_value = config.PFC_value;
        this.PFA_value_solo = config.PFA_value_solo;
        this.PFB_value_solo = config.PFB_value_solo;
        this.PFC_value_solo = config.PFC_value_solo;


        var node = this;
        mapeamentoNode = RED.nodes.getNode(this.mapeamento);

        node.on('input', function(msg, send, done) {
            var globalContext = node.context().global;
            var exportMode = globalContext.get("exportMode");
            var currentMode = globalContext.get("currentMode");

            if(node.type_mode === 'mono'){

                var power_factor_value;
                if(node.pf_select === 'PFA'){ power_factor_value = parseFloat(node.PFA_value_solo); }
                if(node.pf_select === 'PFB'){ power_factor_value = parseFloat(node.PFB_value_solo); }
                if(node.pf_select === 'PFC'){ power_factor_value = parseFloat(node.PFC_value_solo); }

                var mono_command = {
                    type: "AC_power_source_virtual_V1_0", 
                    slot: parseInt(mapeamentoNode.slot),
                    method: "set_power_factor_mono",
                    compare:{},
                    phase_select:0,
                    power_factor_value: power_factor_value,
                };
                command = mono_command;
               
            }else {

                var tri_command = {
                    type: "AC_power_source_virtual_V1_0",
                    slot: parseInt(mapeamentoNode.slot),
                    method: "set_power_factor_tri",
                    compare:{},
                    power_factor_A: parseFloat(node.PFA_value),
                    power_factor_B: parseFloat(node.PFB_value),
                    power_factor_C: parseFloat(node.PFC_value),
                };
                command = tri_command;

            }

            var file = globalContext.get("exportFile");
            var slot = globalContext.get("slot");
            if (!(slot === "begin" || slot === "end")) {
                if (currentMode == "test") {
                    file.slots[slot].jig_test.push(command);
                } else {
                    file.slots[slot].jig_error.push(command);
                }
            } else {
                if (slot === "begin") {
                    file.slots[0].jig_test.push(command);
                } else {
                    file.slots[3].jig_test.push(command);
                }
            }
            globalContext.set("exportFile", file);
            send(msg);
        });
    }
    RED.nodes.registerType("set_power_factor", set_power_factorNode);
};