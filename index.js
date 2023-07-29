


const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 500,
        height: 500,
        selection: true
    });
}

const setBackground = (url, canvas) => {
    fabric.Image.fromURL(url, (img) => {
        canvas.backgroundImage = img
        canvas.renderAll()
    })
}

const toggleMode = (mode) => {    
    if (mode === modes.pan) {
        if (currentMode === modes.pan) {
            currentMode = ''
        } else {
            currentMode = modes.pan
            canvas.isDrawingMode = false
            canvas.renderAll()
        }
    } else if (mode === modes.drawing) {
        if (currentMode === modes.drawing) {
            currentMode = ''
            canvas.isDrawingMode = false
            canvas.renderAll()
        } else {
            currentMode = modes.drawing
            canvas.freeDrawingBrush.color = color
            canvas.freeDrawingBrush.width = 5
            canvas.isDrawingMode = true
            canvas.renderAll()
        }      
    }
}

const setPanEvents = (canvas) => {
    canvas.on('mouse:move', (event) => {
        // console.log(event)
        if (mousePressed && currentMode === modes.pan) {
            canvas.setCursor('grab')
            canvas.renderAll()
            const mEvent = event.e
            const delta = new fabric.Point(mEvent.movementX, mEvent.movementY)
            canvas.relativePan(delta)
        }
    })
    // keep track of mouse down/up
    canvas.on('mouse:down', (event) => {
        mousePressed = true;
        if (currentMode === modes.pan) {
            canvas.setCursor('grab')
            canvas.renderAll()
        }
    })
    canvas.on('mouse:up', (event) => {
        mousePressed = false
        canvas.setCursor('default')
        canvas.renderAll()
    })
}

const setColorListener = () => {
    const picker = document.getElementById('colorPicker')
    picker.addEventListener('change', (event) => {
        console.log(event.target.value)
        color = '#' + event.target.value
        canvas.freeDrawingBrush.color = color
        canvas.requestRenderAll()
    },{passive:true})
}

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG()
    canvas.getObjects().forEach((o) => {
        if(o !== canvas.backgroundImage) {
            canvas.remove(o)
        }
    })
}

const restoreCanvas = (canvas, state, bgUrl) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log(objects)
            objects = objects.filter(o => o['xlink:href'] !== bgUrl)
            canvas.add(...objects)
            canvas.requestRenderAll()
        })
    }
}



const createRect = (canvas) => {
    console.log("rect")
    const canvCenter = canvas.getCenter()
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'green',
        left: canvCenter.left,
        top: 150,
        originX: 'center',
        originY: 'center',
        cornerColor: 'black',
        selectable: true
    })
    canvas.add(rect)
    
    rect.animate('top', canvCenter.top, {
        onChange: canvas.renderAll.bind(canvas)
    });
    rect.on('selected', () => {
        // rect.set('fill', 'white')
        canvas.requestRenderAll()
    })
    rect.on('deselected', () => {
        // rect.set('fill', 'green')
        canvas.requestRenderAll()
    })
    // canvas.renderAll();
}

const createCirc = (canvas) => {
    console.log("circ")
    const canvCenter = canvas.getCenter()
    const circle = new fabric.Circle({
        radius: 50,
        fill: 'orange',
        left: canvCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
        cornerColor: 'white',
        selectable: true
    })
    canvas.add(circle)
    canvas.requestRenderAll()
    circle.animate('top', canvas.height - 50, {
        onChange: canvas.renderAll.bind(canvas),
        onComplete: () => {
            circle.animate('top', canvCenter.top, {
                onChange: canvas.renderAll.bind(canvas),
                easing: fabric.util.ease.easeOutBounce,
                duration: 200
            })
        }
      });
    circle.on('selected', () => {
        circle.set('fill', 'white')
        canvas.requestRenderAll()
    })
    circle.on('deselected', () => {
        circle.set('fill', 'orange')
        canvas.requestRenderAll()
    })
}

const groupObjects = (canvas, group, shouldGroup) => {
    if (shouldGroup) {
        const objects = canvas.getObjects()
        group.val = new fabric.Group(objects, {cornerColor: 'white'})
        clearCanvas(canvas, svgState)
        canvas.add(group.val)
        canvas.requestRenderAll()
    } else {
        group.val.destroy()
        let oldGroup = group.val.getObjects()
        clearCanvas(canvas, svgState)
        canvas.add(...oldGroup)
        group.val = null
        canvas.requestRenderAll()
    }
}

const imgAdded = (e) => {
    console.log(e)
    const inputElem = document.getElementById('myImg')
    const file = inputElem.files[0];
    reader.readAsDataURL(file)
}

const addTextToCanvas = (content) => {
    const text = new fabric.Text(content, {
        left: 50,
        top: 50,
        fontSize: 20,
        fill: 'red'
      });
  
      canvas.add(text);
      canvas.renderAll();
}

const addImageToCanvas = (imagePath, xCoordinate, yCoordinate) => {
    fabric.Image.fromURL(imagePath, function(img) {
        img.set({
          left: xCoordinate,  // Custom X-coordinate
          top: yCoordinate,    // Custom Y-coordinate
          scaleX: 0.5, // Optional: Adjust the scale of the image
          scaleY: 0.5,
        });
        canvas.add(img);
        canvas.renderAll();
      });
}

const exportCanvasToJpg = () => {
    // Export canvas to image format
    var dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.8 });

    // Create an anchor element with the image data as the href
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_image.jpg';

    // Simulate a click event on the anchor to trigger the download
    link.click();
}

const exportCanvasToJSON = () => {
    const json = JSON.stringify(canvas.toJSON());
    return json;
}

const loadJsonToCanvas = (jsonData) => {
      // Load JSON data into canvas
    canvas.loadFromJSON(jsonData, function () {
      // Render canvas after JSON is loaded
      canvas.renderAll();
    });
}

const invertCanvasBy180Degree = () => {
    // Invert canvas by 180 degrees
    canvas.setFlipX(true);
    canvas.setFlipY(true);
    canvas.renderAll();
}

const deleteElementsOnCanvas = () => {
    // Step 1: Identify the object you want to delete
    var objectToDelete = canvas.getActiveObject(); // Or you can retrieve the object using other methods

    // Step 2: Get a reference to the canvas and the object you want to delete

    // Step 3: Remove the object from the canvas
    canvas.remove(objectToDelete);

    // Step 4: Optionally, destroy the object
    objectToDelete.destroy();
}

const copyElementOnCanvas = (selectedElement) => {
    const clonedObject = fabric.util.object.clone(selectedElement);
    clonedObject.set({
        left: 300,
        top: 300
    });

    canvas.add(clonedObject);
}

const canvas = initCanvas('canvas')
const svgState = {}
let mousePressed = false
let color = '#000000'
const group = {}
const bgUrl = 'https://c85ec4c2721d0d1fda7c4d73a2dd9307.cdn.bubble.io/f1678812878088x914327110712574700/Lung%20for%20bubble.svg'

let currentMode;

const modes = {
    pan: 'pan',
    drawing: 'drawing'
}
const reader = new FileReader()

setColorListener()
setBackground(bgUrl, canvas)
setPanEvents(canvas)

const inputFile = document.getElementById('myImg');
inputFile.addEventListener('change', imgAdded, {passive:true})

const lineThicknessSlider = document.getElementById('lineThickness');
// Event listener for the line thickness change event
lineThicknessSlider.addEventListener('input', function() {
    canvas.freeDrawingBrush.width = parseInt(lineThicknessSlider.value);
    canvas.requestRenderAll();
});

// Get the pressure value element
const pressureValue = document.getElementById('pressureValue');

// Set initial pressure value
let currentPressure = 0;

// Event listeners for pointer events
canvas.on('pointerdown', function(e) {
    currentPressure = e.pressure;
    pressureValue.innerText = currentPressure.toFixed(2);
});
  
canvas.on('pointermove', function(e) {
if (e.pressure && e.pressure !== currentPressure) {
    currentPressure = e.pressure;
    pressureValue.innerText = currentPressure.toFixed(2);

    canvas.freeDrawingBrush.width = mapPressureToThickness(currentPressure);
    canvas.requestRenderAll();
}
});
  
canvas.on('pointerup', function() {
currentPressure = 0;
pressureValue.innerText = currentPressure.toFixed(2);
});

// Function to map pressure to line thickness
function mapPressureToThickness(pressure) {
const minThickness = parseInt(lineThicknessSlider.min);
const maxThickness = parseInt(lineThicknessSlider.max);
const pressureRange = 1 - minThickness; // Assume pressure ranges from 0 to 1

return minThickness + Math.round(pressure * pressureRange);
}

reader.addEventListener("load", () => {
    fabric.Image.fromURL(reader.result, img => {
        canvas.add(img)
        canvas.requestRenderAll()
    },{passive:true})
})


