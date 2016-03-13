var context = new AudioContext();
var mediaElement = document.getElementById('player');
var sourceNode = context.createMediaElementSource(mediaElement);
var analyser = context.createAnalyser();
var tuna = Tuna(context);
var lGain = context.createGain();
var mGain = context.createGain();
var hGain = context.createGain();
var frequencyData = new Uint8Array(200);
var svgHeight = '235';
var svgWidth = '956'
console.log(svgWidth);
var barPadding = '0';
var freq = 55 * Math.pow(1.059463, 11);
var osc; //= context.createOscillator();
var wahwah = new tuna.WahWah({
    automode: true, //true/false
    baseFrequency: 0.5, //0 to 1
    excursionOctaves: 3, //1 to 6
    sweep: 0, //0 to 1
    resonance: 2, //1 to 100
    sensitivity: 1, //-1 to 1
    bypass: 0
});
var phaser = new tuna.Phaser({
    rate: 1.2, //0.01 to 8 is a decent range, but higher values are possible
    depth: 0.8, //0 to 1
    feedback: 0.9, //0 to 1+
    stereoPhase: 180, //0 to 180
    baseModulationFrequency: 700, //500 to 1500
    bypass: 0
});
var tremolo = new tuna.Tremolo({
    intensity: 0.2, //0 to 1
    rate: 8, //0.001 to 8
    stereoPhase: 0, //0 to 180
    feedback: 0.9, //0 to 1+
    bypass: 0
});
var chorus = new tuna.Chorus({
    rate: 7, //0.01 to 8+
    feedback: 0.2, //0 to 1+
    delay: 0.45, //0 to 1
    bypass: 0 //the value 1 starts the effect as bypassed, 0 or 1
});
var overdrive = new tuna.Overdrive({
    outputGain: 0.5, //0 to 1+
    drive: 0.1, //0 to 1
    curveAmount: 0, //0 to 1
    algorithmIndex: 4, //0 to 5, selects one of our drive algorithms
    bypass: 0
});
var bitcrusher = new tuna.Bitcrusher({
    bits: 4, //1 to 16
    normfreq: 0.1, //0 to 1
    bufferSize: 4096 //256 to 16384
});
var glitch = new tuna.PingPongDelay({
    wetLevel: 1, //0 to 1
    feedback: 0.9, //0 to 1
    delayTimeLeft: 100, //1 to 10000 (milliseconds)
    delayTimeRight: 100 //1 to 10000 (milliseconds)
});
var moog = new tuna.MoogFilter({
    cutoff: 0.065,    //0 to 1
    resonance: 3.5,   //0 to 4
    bufferSize: 4096  //256 to 16384
});
//play with wahwah effect
function createWahWah() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(wahwah.input);
    wahwah.connect(context.destination);
    osc.start(0);
}
//play with phaser effect
function createPhaser() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(phaser.input);
    phaser.connect(context.destination);
    osc.start(0);
}
//play with tremolo effect
function createTremolo() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(tremolo.input);
    tremolo.connect(context.destination);
    osc.start(0);
}

function createChorus() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(chorus.input);
    chorus.connect(context.destination);
    osc.start(0);
}

function createOverdrive() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(overdrive.input);
    overdrive.connect(context.destination);
    osc.start(0);
}

function createBitcrusher() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(bitcrusher.input);
    bitcrusher.connect(context.destination);
    osc.start(0);
}
function createGlitch() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(glitch.input);
    glitch.connect(context.destination);
    osc.start(0);
}
function createMog() {
    osc = context.createOscillator();
    osc.type = 'triangle'; // triangle wave
    osc.frequency.value = freq
    osc.connect(moog.input);
    moog.connect(context.destination);
    osc.start(0);
}

function stopWave() {
    osc.stop(0);
}

function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width).attr('class', 'visualizer');
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        document.getElementById("player").setAttribute("src", e.target.result);
        console.log(file.name);
        document.getElementById('track-title').innerHTML = file.name;
    };
    reader.readAsDataURL(file);
}

function changeValue(string, type) {
    var value = parseFloat(string) / 100.0;
    switch (type) {
        case 'lowGain':
            lGain.gain.value = value;
            break;
        case 'midGain':
            mGain.gain.value = value;
            break;
        case 'highGain':
            hGain.gain.value = value;
            break;
    }
}

function setPlaySpeed() {
    var aud = document.getElementById("player");
    var speed = parseFloat($('#speed').val());
    aud.playbackRate = speed;
}
$(document).ready(function() {
    // visualizer
    sourceNode.connect(analyser);
    sourceNode.connect(context.destination);
    var svg = createSvg('#equalizer-container', svgHeight, svgWidth);
    // Create our initial D3 chart.
    svg.selectAll('rect').data(frequencyData).enter().append('rect').attr('x', function(d, i) {
        return i * (svgWidth / frequencyData.length);
    }).attr('width', Math.round(svgWidth / frequencyData.length - barPadding));
    // Continuously loop and update chart with frequency data.
    function renderChart() {
        requestAnimationFrame(renderChart);
        // Copy frequency data to frequencyData array.
        analyser.getByteFrequencyData(frequencyData);
        // Update d3 chart with new data.
        svg.selectAll('rect').data(frequencyData).attr('y', function(d) {
            return svgHeight - d;
        }).attr('height', function(d) {
            return d;
        }).attr('fill', function(d) {
            return 'rgb(100, 150, ' + d + ')';
        });
    }
    // EQ Properties
    var gainDb = -40.0;
    var bandSplit = [360, 3600];
    var hBand = context.createBiquadFilter();
    hBand.type = "lowshelf";
    hBand.frequency.value = bandSplit[0];
    hBand.gain.value = gainDb;
    var hInvert = context.createGain();
    hInvert.gain.value = -1.0;
    var mBand = context.createGain();
    var lBand = context.createBiquadFilter();
    lBand.type = "highshelf";
    lBand.frequency.value = bandSplit[1];
    lBand.gain.value = gainDb;
    var lInvert = context.createGain();
    lInvert.gain.value = -1.0;
    sourceNode.connect(lBand);
    sourceNode.connect(mBand);
    sourceNode.connect(hBand);
    hBand.connect(hInvert);
    lBand.connect(lInvert);
    hInvert.connect(mBand);
    lInvert.connect(mBand);
    lBand.connect(lGain);
    mBand.connect(mGain);
    hBand.connect(hGain);
    var sum = context.createGain();
    lGain.connect(sum);
    mGain.connect(sum);
    hGain.connect(sum);
    sum.connect(context.destination);
    $('#open-file').on('click', function() {
        document.getElementById('fileInput').click();
    });
    $('#reset-speed').on('click', function() {
        $('#speed').val(1);
        setPlaySpeed();
    });
    $('#reset-low-gain').on('click', function() {
        $('#low-gain').val(50);
        changeValue(50, 'lowGain');
    });
    $('#reset-mid-gain').on('click', function() {
        $('#mid-gain').val(50);
        changeValue(50, 'midGain');
    });
    $('#reset-high-gain').on('click', function() {
        $('#high-gain').val(50);
        changeValue(50, 'highGain');
    });
    $('input:checkbox').click(function() {
        var $inputs = $('input:checkbox')
        if ($(this).is(':checked')) {
            $inputs.not(this).prop('disabled', true);
        } else {
            $inputs.prop('disabled', false);
        }
    })
    $('#wahwah').change(function() {
        this.checked ? createWahWah() : stopWave();
    });
    $('#phaser').change(function() {
        this.checked ? createPhaser() : stopWave();
    });
    $('#tremolo').change(function() {
        this.checked ? createTremolo() : stopWave();
    });
    $('#chorus').change(function() {
        this.checked ? createChorus() : stopWave();
    });
    $('#overdrive').change(function() {
        this.checked ? createOverdrive() : stopWave();
    });
    $('#bitcrusher').change(function() {
        this.checked ? createBitcrusher() : stopWave();
    }); 
    $('#glitch').change(function() {
        this.checked ? createGlitch() : stopWave();
    });
    $('#moog').change(function() {
        this.checked ? createMog() : stopWave();
    });
    renderChart();
});