import morse from "./morseCodes.json" with {type:'json'};
const terminal = document.querySelector(".command-body");

const commandList = ['help', 'date','echo','clear','encode','decode'];
const helpComment = [
    "Supported Commands :<br><br>",
    "<strong class='help_cmd-title'>help</strong> display available executable commands.<br>",
    "<strong class='help_cmd-title'>date</strong> display current date.<br>",
    "<strong class='help_cmd-title'>echo</strong> print follow-up string/sentence : echo [string].<br>",
    "<strong class='help_cmd-title'>clear</strong> clears command history from terminal window display.<br>",
    "<strong class='help_cmd-title'>encode</strong> encode message : encode -flag [string] {flags : m - morse_code encoding , b - binary encoding}<br>",
    "<strong class='help_cmd-title'>decode</strong> decode message -> string: decode -flag [string] {flags : m - morse_code decoding , b - binary decoding}"
];

let cmdHistory = [];
let cmdHistoryEndPtr = 0;
let currentLine = 0;

class CipherCompiler {
    constructor(command_Components){
        this.raw_string = `${command_Components.slice(2,).join(' ').replace(/"/g,'')}`;
        this.encode_format = `${command_Components[1]}`;
    }
    encode_format_error(){
        return this.encode_format === "-m" || this.encode_format === "-b"? 0:1;
    }
    encode(){
        return this.encode_format === "-m"? this.morseEncode():this.binaryEncode();
    }
    decode(){
        return this.encode_format === "-m"? this.morseDecode():this.binaryDecode();
    }

    morseEncode(){
        let encoded_msg = '';
        Array.from(this.raw_string).forEach(character =>{
            if(morse[character.toLowerCase()]){
                encoded_msg+=morse[character.toLowerCase()];
                encoded_msg+= " "
            }else if(character === " "){
                encoded_msg+="/ "
            }else{
                encoded_msg+=character;
                encoded_msg+=" ";
            }
        });
        return encoded_msg;
    }
    morseDecode(){
        let decoded_msg = '';
        this.raw_string.split(" ").forEach(character =>{
            for(const key in morse){
                if(morse[key] === character){
                    decoded_msg+=key;
                    return;
                }
            }
            if(character === "/"){
                decoded_msg+= " ";
            }else if(!character.includes(['.','-','/'])){
                decoded_msg+=character;
            }
        });
        return decoded_msg;
    }
    binaryEncode(){
        let encoded_msg = "";
        Array.from(this.raw_string).forEach(character =>{
            encoded_msg+=character.charCodeAt(0).toString(2).padStart(8,'0');
            encoded_msg+=" ";
        });
        return encoded_msg;
    }
    binaryDecode(){
        let decoded_msg = "";
        if(this.raw_string.split(" ").length > 1){
            this.raw_string.split(" ").forEach(character =>{
                decoded_msg+=String.fromCharCode(parseInt(character,2));
            });
        }else{
            for (let i=0;i<this.raw_string.length; i+=8){
                decoded_msg+=String.fromCharCode(parseInt(this.raw_string.slice(i,i+8), 2));
            }
        }
        return decoded_msg;
    }

}

const raiseError = (msg) => {
    const res = document.createElement('p');
    res.className = 'cmd-result-err';
    res.innerHTML = `${msg}`;
    res.innerHTML += `<br>Use &nbsp;"<u>help</u>"&nbsp; to view available commands and their usage.`;
    return res;
}

const execCommand = (command) =>{
    cmdHistoryEndPtr = cmdHistory.length;
    if(command.length === 0){
        return;
    }
    const result = document.createElement('span');
    result.className = 'cmd-result';
    var res = document.createElement('p');
    const commandComp = command.replace(/\u00A0/g," ").split(" ").filter((item => item.length > 0));
    if(!commandList.includes(commandComp[0])){
        res = raiseError(`Unknown command : ${command}`);
    }
    else{
        cmdHistory.push(`${command}`);
        res.className = 'cmd-result-success';
        switch(commandComp[0]){
            case 'clear':
                terminal.innerHTML = '';
                currentLine = 0;
                return;

            case 'echo':
                res.innerHTML = `${commandComp.slice(1,).join(' ').replace(/"/g,'')}`;
                break;
            
            case 'help':
                helpComment.forEach(command=>{
                    res.innerHTML += `${command}`;
                })
                res.classList.add('cmd-help');
                break;

            case 'encode':
                const encode = new CipherCompiler(commandComp);
                if(encode.encode_format_error()){
                    res =  raiseError(`Unexpected flag :  ${encode.encode_format}`);
                    break;
                }
                res.innerHTML = `<em style="color:#00c4df">Ciphered =></em> ${encode.encode()}`;
                break;
            case 'decode':
                const decode = new CipherCompiler(commandComp);
                if(decode.encode_format_error()){
                    res =  raiseError(`Unexpected flag :  ${decode.encode_format}`);
                    break;
                }
                res.innerHTML = `<em style="color:#00c4df">Deciphered =></em> ${decode.decode()}`;
                break;
            
            case 'date':
                res.innerHTML = `${Date().toLocaleString()}`;
                break;
        }
    }
    result.appendChild(res);
    return result;
}

const triggerEnter = () => {
    let cmd = document.querySelector(`#line-${currentLine}`)
    cmd.contentEditable = 'false';
    cmd = cmd.innerText;

    var result = execCommand(cmd);
    result?terminal.appendChild(result):{};

    currentLine+=1;
    newLine(currentLine);
}

const newLine = (current) => {
    const line = document.createElement('span');
    const pwd = document.createElement('p');
    const input = document.createElement('p');

    line.className='command-line';
    input.classList = 'input-cmd';
    input.id = `line-${current}`;
    pwd.style.margin = 0;
    input.style.margin = 0;

    pwd.innerHTML = `<span class="color-gy">guest@vaibhav</span> ~ >$&nbsp;`;
    input.innerHTML = '';
    input.contentEditable = 'true';
    
    line.appendChild(pwd);
    line.appendChild(input);
    terminal.appendChild(line);
    input.focus();
}

const getCmdHistory = (posPtr) => {
    if(cmdHistory[posPtr]){
        return cmdHistory[posPtr];
    }
    return;
}

document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('.welcome-comment').innerHTML = `To print available commands, type "help" and press Enter.`;
    newLine(currentLine);
    
    terminal.addEventListener('keypress', function(event){
        if(event.key === 'Enter' || event.keyCode === 13){
            event.preventDefault();
            triggerEnter();
        }
    });
    terminal.addEventListener('keydown',function(event){
        if(event.key === 'ArrowUp'){
            let fetchCmd = getCmdHistory(cmdHistoryEndPtr);
            cmdHistoryEndPtr-=1
            cmdHistoryEndPtr<0?cmdHistoryEndPtr=0:{};
            fetchCmd ?document.querySelector(`#line-${currentLine}`).innerText = `${fetchCmd}`:{};
            event.preventDefault();
        }
        if(event.key === 'ArrowDown'){
            cmdHistoryEndPtr +=1;
            cmdHistoryEndPtr>cmdHistory.length?cmdHistoryEndPtr=cmdHistory.length:{};
            let fetchCmd = getCmdHistory(cmdHistoryEndPtr);
            fetchCmd?document.querySelector(`#line-${currentLine}`).innerText = `${fetchCmd}`:
            document.querySelector(`#line-${currentLine}`).innerText = '';
            event.preventDefault();
        }
    });
    terminal.addEventListener('mouseenter', function(){
        document.querySelector(`#line-${currentLine}`).focus();
    });
    document.addEventListener('copy', function(event) {
        const selection = window.getSelection().toString();
        navigator.clipboard.writeText(`${selection}`);
        event.preventDefault();
    });
    terminal.addEventListener('paste', function(event) {
        const text = event.clipboardData.getData('text');
        document.querySelector(`#line-${currentLine}`).innerText += `${text}`;
        event.preventDefault();
    });
})