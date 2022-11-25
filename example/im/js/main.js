dialog.innerHTML = '';

var utils = odd.utils,
    events = odd.events,
    Event = events.Event,
    NetStatusEvent = events.NetStatusEvent,
    Level = events.Level,
    Code = events.Code;

var users = {};

var ui = odd.im.ui.create({ mode: 'file' });
ui.addEventListener(NetStatusEvent.NET_STATUS, onStatus);
ui.addEventListener(Event.CLOSE, onClose);
ui.setup(dialog, {
    maxRetries: -1,
    skin: 'classic',
    url: 'wss://' + location.host + '/im',
    options: {
        token: 'xxx',
    },
    plugins: [{
        kind: 'Messages',
        layout: '',
        dialog: {
            title: '[Button:close=][Label:title=][Button:more=]',
            toolbar: '[Select:emojipicker=]',
            label: 'Send',
            maxlength: 500,
        },
        visibility: true,
    }, {
        kind: 'Contacts',
        visibility: true,
    }, {
        kind: 'Settings',
        visibility: true,
    }],
}).then(() => {
    ui.join('001').catch((err) => {
        ui.logger.error(`Failed to join 001: ${err}`);
    });
});

function onStatus(e) {
    var level = e.data.level;
    var code = e.data.code;
    var description = e.data.description;
    var info = e.data.info;
    var method = { status: 'log', warning: 'warn', error: 'error' }[level];
    ui.logger[method](`IM.onStatus: level=${level}, code=${code}, description=${description}, info=`, info);

    switch (code) {
        case Code.NETGROUP_LOCALCOVERAGE_NOTIFY:
            users = utils.extendz(info.list, users);
            ui.logger.log(`Online: ${Object.keys(users).length}`);
            break;
        case Code.NETGROUP_NEIGHBOR_CONNECT:
            users[info.user.id] = info.user;
            ui.logger.log(`Online: ${Object.keys(users).length}`);
            break;
        case Code.NETGROUP_NEIGHBOR_DISCONNECT:
            delete users[info.user.id];
            ui.logger.log(`Online: ${Object.keys(users).length}`);
            break;
    }
}

function onClose(e) {
    ui.logger.log(`IM.onClose: ${e.data.reason}`);
}