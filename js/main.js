//jshint -W117
'use strict'

let inputCanvas = document.getElementById('input')
let outputCanvas = document.getElementById('output')
let targetCanvas = document.getElementById('target')

let inputCtx = inputCanvas.getContext('2d')
let outputCtx = outputCanvas.getContext('2d')
let targetCtx = targetCanvas.getContext('2d')

const INPUT_DIM = 3 // inputCanvas.width * inputCanvas.height * 3
const HIDDEN_DIM = 20 // INPUT_DIM * 1.5
const OUTPUT_DIM = 3 // outputCanvas.width * outputCanvas.height * 3

let network = new synaptic.Architect.Perceptron(INPUT_DIM, HIDDEN_DIM, OUTPUT_DIM)
let iterationCount = 0

// I need these in the global scope
let inputImage // = inputCtx.getImageData(0, 0, inputCanvas.width, inputCanvas.height)
let targetImage // = targetCtx.getImageData(0, 0, targetCanvas.width, targetCanvas.height)
let inputData // = inputImage.data
let targetData // = targetImage.data

var img = new Image();
img.src = './assets/smile.jpeg';
img.onload = function() {
  inputCtx.drawImage(img, 0, 0);
  img.style.display = 'none';
  init()
}

function init() {
  inputImage = inputCtx.getImageData(0, 0, inputCanvas.width, inputCanvas.height)
  targetImage = targetCtx.createImageData(targetCanvas.width, targetCanvas.height)
  let transformedImageData = transform(inputImage.data)

  targetImage.data.map((elem, i) => targetImage.data[i] = transformedImageData[i])
  targetCtx.putImageData(targetImage, 0, 0)

  inputData = inputImage.data
  targetData = targetImage.data

  setTimeout(main, 0)
}

function main() {
  let outputData = []
  // if (iterationCount % 1 === 0)
  //   console.log(iterationCount);

  // transform(targetImage.data); targetCtx.putImageData(targetImage, 0, 0)

  for (let i = 0; i < inputData.length; i += 4) {
    let input = [inputData[i] / 255, inputData[i+1] / 255, inputData[i+2] / 255]
    let target = [targetData[i] / 255, targetData[i+1] / 255, targetData[i+2]  / 255]

    let current = learn(input, target)
    current.push(1)
    outputData.push(current)
  }
  showOutput(outputData, outputCanvas)

  outputCtx.font = '20px monospace'
  outputCtx.fillStyle = '#ffffff'
  outputCtx.fillText(iterationCount, 25, 25)

  if (++iterationCount < 1000)
    setTimeout(main, 0)

  applyNetwork('colorwheel.png')
}

function learn(inputData, targetData) {
  let rgb = network.activate(inputData)
  network.propagate(0.3, targetData)
  return rgb
}

function applyNetwork(imageName) {
  let img = new Image()
  let canvas = document.createElement('canvas')
  canvas.width = canvas.height = 300
  let ctx = canvas.getContext('2d')
  img.src = './assets/' + imageName
  img.onload = function() {
    document.body.appendChild(canvas)
    ctx.drawImage(img, 0, 0);
    ctx.font = '20px monospace'
    ctx.fillStyle = '#000000'
    ctx.fillText(iterationCount, 25, 25)
    let output = []
    let inputData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

    for (let i = 0; i < inputData.length; i += 4) {
      let input = [inputData[i] / 255, inputData[i+1] / 255, inputData[i+2] / 255]
      let rgb = network.activate(input)
      rgb.push(1)
      output.push(rgb)
      // console.log(rgb[0] - input[0]);
    }

    showOutput(output, canvas)
  }
}

function showOutput(newImageData, canvas) {
  let flattened = [];
  let ctx = canvas.getContext('2d')
  let outputImage = ctx.createImageData(canvas.width, canvas.height)

  for (let i = 0; i < newImageData.length; i++)
    for (let j = 0; j < newImageData[i].length; j++)
      flattened.push(newImageData[i][j])

  outputImage.data.map((elem, i) => outputImage.data[i] = Math.floor(flattened[i] * 255) || 0)
  ctx.putImageData(outputImage, 0, 0)
}

function transform(data) {
  return invertColors(data)
}

function invertColors(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i];     // red
    data[i + 1] = 255 - data[i + 1]; // green
    data[i + 2] = 255 - data[i + 2]; // blue
  }
  return data
}

function greyScale(data) {
  for (let i = 0; i < data.length; i += 4) {
    let avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i]   = avg
    data[i+1] = avg
    data[i+2] = avg
  }
  return data
}

function switchColors(data) {
  for (let i = 0; i < data.length; i += 4) {
    let red, green, blue
    [red, green, blue] = [data[i], data[i+1], data[i+2]]
    data[i]     = green;  // red
    data[i + 1] = blue; // green
    data[i + 2] = red;   // blue
  }
  return data
}

function randomizeColors(data) {
  let red = Math.random() * 100 - 50
  let green = Math.random() * 100 - 50
  let blue = Math.random() * 100 - 50
  let halfway = Math.floor(data.length / 2)
  for (let i = 0; i < halfway; i += 4) {
    data[i]     += red;
    data[i + 1] += green;
    data[i + 2] += blue;
  }

  for(let i = data.length; i > halfway; i -= 4){
    data[i - 3] -= red;
    data[i - 2] -= green;
    data[i - 1] -= blue;
  }
  return data
}
