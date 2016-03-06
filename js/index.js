var context = new(window.AudioContext || window.webkitAudioContext)();
var mediaElement = document.getElementById('player');
var sourceNode = context.createMediaElementSource(mediaElement);
var analyser = context.createAnalyser();

var lGain = context.createGain();
var mGain = context.createGain();
var hGain = context.createGain();

var frequencyData = new Uint8Array(200);

var svgHeight = '250';
var svgWidth = '1200';
var barPadding = '1';

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
    svg.selectAll('rect')
        .data(frequencyData)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
            return i * (svgWidth / frequencyData.length);
        })
        .attr('width', Math.round(svgWidth / frequencyData.length - barPadding));

    // Continuously loop and update chart with frequency data.
    function renderChart() {
        requestAnimationFrame(renderChart);

        // Copy frequency data to frequencyData array.
        analyser.getByteFrequencyData(frequencyData);

        // Update d3 chart with new data.
        svg.selectAll('rect')
            .data(frequencyData)
            .attr('y', function(d) {
                return svgHeight - d;
            })
            .attr('height', function(d) {
                return d;
            })
            .attr('fill', function(d) {
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

    renderChart();
});
