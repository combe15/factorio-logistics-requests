function minMax() {
    var minimum = document.getElementById('minimumValue')
    var maximum = document.getElementById('maximumValue')

    if (parseInt(maximum.value) < parseInt(minimum.value)) {
        maximum.value = minimum.value
    }
}

function maxMin() {
    var minimum = document.getElementById('minimumValue')
    var maximum = document.getElementById('maximumValue')

    if (parseInt(maximum.value) < parseInt(minimum.value)) {
        minimum.value = maximum.value
    }
}

function clearLogisticSlot() {
    var slotNumber = document.getElementById('slotNumber').value
    document.getElementById('itemName').value = ""
    document.getElementById('minimumValue').value = "0"
    document.getElementById('maximumValue').value = "4294967295"

    var cookie = JSON.parse(document.cookie);
    cookie[slotNumber] = { 'item': '', 'min': '0', 'max': '4294967295' }
    document.cookie = JSON.stringify({});

    console.log("Logistic Slot " + slotNumber + " cleared.")
}

function saveLogisticSlot() {
    if (document.getElementById('slotNumber').value == "") {
        alert("Select a slot before saving")
        return
    }
    var slotNumber = document.getElementById('slotNumber').value;
    var itemName = document.getElementById('itemName').value;
    var minimumValue = document.getElementById('minimumValue').value;
    var maximumValue = document.getElementById('maximumValue').value;

    if (!itemName) { // if an input is missing
        alert("Missing item name") // TODO: make a better fail message
        return
    }

    var cookie = JSON.parse(document.cookie);

    cookie[slotNumber]['item'] = itemName
    cookie[slotNumber]['min'] = minimumValue
    cookie[slotNumber]['max'] = maximumValue

    document.cookie = JSON.stringify(cookie);
    console.log("Saving slot to Cookies: " + JSON.stringify(cookie[slotNumber]))
}

function selectLogisticSlot(buttonObject) {
    if ((document.cookie == undefined) || (document.cookie == "")) {
        var dict = {};
        document.cookie = JSON.stringify({});
        console.log(document.cookie)
    }
    var cookie = JSON.parse(document.cookie);
    if (!cookie.hasOwnProperty(buttonObject.name)) {
        cookie[buttonObject.name] = { 'item': '', 'min': '0', 'max': '0' }
        document.cookie = JSON.stringify(cookie);
    }
    document.getElementById('slotNumber').value = buttonObject.name
    document.getElementById('itemName').value = cookie[buttonObject.name]['item']
    document.getElementById('minimumValue').value = cookie[buttonObject.name]['min']
    document.getElementById('maximumValue').value = cookie[buttonObject.name]['max']
    document.cookie = JSON.stringify(cookie);
    console.log("Slot selected: " + buttonObject.name + " | Contents: " + JSON.stringify(cookie[buttonObject.name]))
}

function addRow() {
    // clone last row and increment name
    var table = document.getElementById("configurationTable");
    var cell = table.rows[table.rows.length - 1].cloneNode(true)
    for (let i = 0; i < cell.childElementCount; i++) {
        cell.children[i].children[0].name = parseInt(cell.children[i].children[0].name) + 10;
    }
    console.log("Added new row")
    table.appendChild(cell);
};

function generate() {
    var output = document.getElementById("output");
    var cookie = JSON.parse(document.cookie);
    //var cookie ={1: {item: 'item', min: '0', max: '0'}, 4: {item: 'item4', min: '0', max: '0'}}

    var startingCommand = "/silent-command\nlocal p = game.player\nlocal c = p.clear_personal_logistic_slot\nlocal s = p.set_personal_logistic_slot\nfor k = 1, 1000 do c(k) end;"
    var itemArray = ""

    console.log(cookie)
    for (const key in cookie) {
        if (cookie[key]["item"] == "") {
            console.log(`Invalid name at position ${key}, skipping`)
            continue
        }
        itemArray += (`\ns(${key},{max=${cookie[key]["max"]},min=${cookie[key]["min"]},name=${cookie[key]["item"]}})`)
        console.log(`s(${key},{max=${cookie[key]["max"]},min=${cookie[key]["min"]},name=${cookie[key]["item"]}})`)
    }

    output.value = startingCommand + itemArray
    createShareString()
}

function createShareString() {
    var cookie = JSON.parse(document.cookie);
    for (const key in cookie) {
        if (cookie[key]["item"] == "") {
            delete cookie[key] // remove unwanted data for compression
        }
    }
    var json = JSON.stringify(cookie);
    var enc = new TextEncoder("utf-8").encode(json);
    var data = pako.deflate(enc, { level: 9 });
    var encoded = toBase64(data);
    console.log(encoded)
    document.getElementById("sharestring").value = encoded
}

function toBase64(buf) {
    var binaryString = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    return btoa(binaryString);
}

function fromBase64(buf) {
    return Uint8Array.from(atob(buf), c => c.charCodeAt(0))
}

function importData() {
    var base64 = document.getElementById("sharestring").value;
    var output = document.getElementById("output")
    if (base64 == '') {
        output.value = ""
        return;
    }

    let data = fromBase64(base64)
    console.log(data)

    let encode = pako.inflate(data)
    console.log(encode)

    var jsonString = new TextDecoder("utf-8").decode(pako.inflate(data));
    console.log(jsonString)

    document.cookie = jsonString
}
