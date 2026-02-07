function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rows = 29;

document.getElementById("mobile-input").addEventListener('keydown', (e) => {
  const newEvent = new KeyboardEvent(e.type, e);
});

let do_intro = true;
let cmd_prompt = "about";

let delete_word = false;

let screen_buffer = [];
let console_text_element = document.getElementById("text");

let bios = [
    `Award Modular BIOS v4.51PG, An Energy Star Ally
Copyright (C) 1984—97, Award Software, Inc.

(55XUUQ0E) Intel i430VX PCIset(TM)

PENTIUM-S CPU at 75MHz
<img class="energy-star image-hue-adjust" src="./assets/energy_star.png" draggable="false"></img><span class="text bottom-text" >Press <span class="text" style="color:lightgreen !important">ESC</span> to skip intro<br>12/10/97-i430VX,UMC8669-2A59GH2BC-00<span>`,
    "Memory Test :  {0-32768}K OK",
    `
Award Plug and Play BIOS Extension  v1.0A
Copyright (C) 1997, Award Software, Inc.`,
    `  Detecting IDE Primary Master ... PCemHD`,
    `  Detecting IDE Primary Slave ... PCemCD`,
    `  Detecting IDE Secondary Master ... None`,
    `  Detecting IDE Secondary Slave ... None`
];

let bios_delays = [
    333,
    333,
    2166,
    433,
    433,
    433 * 2,
    433
];

async function bios_screen() {
    await wait(3000);
    const numloop_regex = /{(\d+)-(\d+)}/;
    for (let i = 0; i < bios.length; i++) {
        if (!do_intro) {
            return;
        }
        const string = bios[i]
        if (numloop_regex.test(string)) {
            let match = string.match(numloop_regex);
            let lower = parseInt(match[1]);
            let upper = parseInt(match[2]);
            console.log(lower, upper);

            push_to_console(string.replace(numloop_regex, `<span id="${string}"></span>`));

            for (let i = lower; i <= upper; i += upper / 30) {
                document
                    .getElementById(string)
                    .innerText = parseInt(i);
                await wait(1);
            }
            screen_buffer[screen_buffer.length - 1] = string.replace(numloop_regex, upper);
            draw_screen();

        } else {
            push_to_console(string);
        }
        await wait(bios_delays[i]);
    }
}
let transition = [`<span class="text sysconf-text">System Configurations</span>
╔══════════════════════════════════════════════════════════════════════════════╗
║ CPU Type          : PENTIUM-S           Base Memory       : 640K             ║
║ Co-Processor      : Installed           Extended Memory   : 31744K           ║
║ CPU Clock         : 75MHz               Cache Memory      : None             ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ Diskette Drive  A : 2.88M, 3.5in.       Display Type      : EGA/VGA          ║
║ Diskette Drive  B : None                Serial Port(s)    : 3F8 2F8          ║
║ Pri. Master  Disk : LBA ,Mode 2, 2621MB Parallel Port(s)  : 378              ║
║ Pri. Slave   Disk : CDROM, Mode 4       EDO DRAM at Row(s): None             ║
║ Sec. Master  Disk : None                SDRAM at Row(s)   : 0 1 2 3 4        ║
║ Sec. Slave   Disk : None                L2 Cache Type     : None             ║
╚══════════════════════════════════════════════════════════════════════════════╝
`, `PCI Device Listing.....
Bus No. Device No. Func No. Vendor ID   Device ID   Device Class           IRQ
────────────────────────────────────────────────────────────────────────────────
   0        7         1        8086        1230     IDE Controller          14  
   0       17         0        1274        1371     Multimedia Device       11`, `Verifying DMI Pool Data ......`, `Starting DOS .....`]

let transition_delays = [500, 900, 600, 999]

async function draw_screen() {
    console_text_element.innerHTML = "";
    for (let i = 0; i < screen_buffer.length; i++) {
        console_text_element.innerHTML += screen_buffer[i] + "\n";
    }
}

async function push_to_console(...args) {
    let string = args.join(" ");
    let temp = string.split("\n");
    for (const str of temp) {
        screen_buffer.push(str)
        if (screen_buffer.length > rows) {
            screen_buffer.shift();
        }
    }
    draw_screen();
}

async function clear_console() {
    screen_buffer = [];
    draw_screen();
}

async function transition_to_console() {
    for (let i = 0; i < transition.length; i++) {
        if (do_intro) {
            push_to_console(transition[i]);
            await wait(transition_delays[i]);
        }
    }
}

function print_prompt() {
    push_to_console(`<span id="full_prompt">C:\\><span class="text" id="prompt"></span></span><span class="text cursor" id="cursor">_</span>`)
}

function submit_prompt() {
    screen_buffer[screen_buffer.length - 1] = document
        .getElementById("full_prompt")
        .innerText
    draw_screen();
    do_command();
    cmd_prompt = "";
    print_prompt();
}

const commands = {
    "about": () => {
        push_to_console(`Hi! I am sane, a computer science student currently studying at TU Wien.
You can find me here: 
    <img class="inline-image" src="./assets/GitHub_Invertocat_Black.svg" /><a href="https://github.com/san-e">Github</a>    <img class="inline-image" src="./assets/fontawesome_envelope.svg" /><a href="mailto:tim@jarzev.de">E-Mail</a>   <img class="inline-image" src="./assets/fontawesome_discord.svg" /><a href="https://discordapp.com/users/440178410921263104">Discord</a>
Type "help" to view the available commands and look around a bit :)`)
    },
    "cls": clear_console,
    "clear": clear_console,
    "echo": push_to_console,
    "help": show_help,
    "reboot": () => {
        location.reload()
    },
}

const explanations = {
    "about": "Show introductory text",
    "cls": "Clear screen",
    "clear": "Clear screen",
    "echo": "Print given message to screen",
    "help": "Show list of available commands",
    "reboot": "Reboot this computer",
    "starfield": "Neat little animation"
}

function show_help() {
    push_to_console(`Available commands:\n  ${Object.keys(commands).map((command => {return Object.keys(explanations).includes(command) ? `${command}\t\t- ${explanations[command]}`: command})).join("\n  ")}`)
}

function do_command() {
    let cmd = cmd_prompt.split(" ");
    if (Object.keys(commands).includes(cmd[0])) {
        if (cmd.length == 1) {
            commands[cmd[0]]();
        } else {
            commands[cmd[0]](...cmd.slice(1));
        }
    } else {
        push_to_console(`Command ${cmd[0]} was not found.`)
    }
}

async function main() {
    if (do_intro) {
        await bios_screen();
    }
    if (do_intro) {
        await clear_console();
    }
    if (do_intro) {
        await transition_to_console();
    }
    if (do_intro) {
        await print_prompt();
        document
            .getElementById("prompt")
            .innerText = cmd_prompt;
        await submit_prompt();
        do_intro = false;
    }
}

document.addEventListener("keydown", (event) => {
    const keyName = event.key;
    if (keyName === "Backspace") {
        if (event.ctrlKey) {
            cmd_prompt = cmd_prompt.substring(0, cmd_prompt.lastIndexOf(" "));
        } else {
            cmd_prompt = cmd_prompt.substring(0, cmd_prompt.length - 1);
        }
    } else if (keyName == "Control") {
        delete_word = true;
    } else if (keyName == "Enter") {
        submit_prompt();
        cmd_prompt = "";
    } else if (keyName == "Escape") {
        if (do_intro) {
            do_intro = false;
            clear_console();
            print_prompt();
            document
                .getElementById("prompt")
                .innerText = cmd_prompt;
            submit_prompt();
        }
    } else if (keyName.length <= 1) {
        cmd_prompt += keyName;
    }
    document
        .getElementById("prompt")
        .innerText = cmd_prompt;
});

console_text_element.addEventListener('click', () => {
    document.getElementById("mobile-input").focus();
});

main();