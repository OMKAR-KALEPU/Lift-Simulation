let liftPositions = [];
let isLiftAvailable = [];
let liftsRequested = {
    up: [],
    down: [],
}
let floorServiced = {
    up: [],
    down: [],
};

const simulationForm = document.getElementById('simulation-form');

simulationForm.addEventListener('submit', function (e) {
    e.preventDefault();
    init();
})

const init = () => {

    const nbrOfFloors = parseInt(document.getElementById('nbrOfFloors').value);
    const nbrOfLifts = parseInt(document.getElementById('nbrOfLifts').value);

    if (nbrOfFloors < 0 || nbrOfLifts < 0) {
        alert('Floors & Lifts cannot be negative! 🙄');
        return;
    }

    if (nbrOfFloors === 0) {
        alert('No lift is required!');
        return;
    }

    if (nbrOfLifts === 0) {
        alert('Atleast 1 lift is required');
        return;
    }

    const mainContainer = document.getElementById('main-container');
    mainContainer.style.display = 'none';

    const simulationContainer = document.getElementById('simulation-container');
    simulationContainer.style.display = 'block';
    simulationContainer.innerHTML = '';

    construct(nbrOfFloors, nbrOfLifts, simulationContainer);

}

const construct = (floors, lifts, container) => {

    for (let i = floors; i >= 0; i--) {

        /**
         * Initially no floor is serviced
        */
        floorServiced.up[i] = false;
        floorServiced.down[i] = false;

        /**
         * Construct floors and lifts
        */
        const floorDiv = document.createElement('div');

        floorDiv.classList.add('each-floor');
        floorDiv.dataset.floor = i;

        const floorEngine = document.createElement('div');
        floorEngine.classList.add('floor-engine');
        floorEngine.innerHTML = `<span>Floor - ${i}</span>
                                ${i < floors ? `<button class='btn btn-primary btn-up' data-floor='${i}'>Up</button>` : ''}
                                ${i > 0 ? `<button class='btn btn-primary btn-down' data-floor='${i}'>Down</button>` : ''}`;

        floorDiv.appendChild(floorEngine);

        /**
         * Setup lifts at floor 0
        */
        if (i == 0) {
            const initialLifts = document.createElement('div');
            initialLifts.classList.add('initial-lifts');

            for (let j = 0; j < lifts; j++) {
                const liftDiv = document.createElement('div');
                liftDiv.classList.add('each-lift');
                liftDiv.dataset.lift = j + 1;
                liftDiv.dataset.currFloor = 0;
                liftDiv.innerHTML = `<div class='lift-door left-door'></div>
                                     <div class='lift-door right-door'></div>`;
                initialLifts.appendChild(liftDiv);
                liftPositions.push(0);
                isLiftAvailable.push(true);
            }

            floorEngine.appendChild(initialLifts);
        }

        container.appendChild(floorDiv);

    }

    /**
     * Setup event listerners for lift operations
    */
    document.querySelectorAll('.btn-up').forEach((upBtn) => {
        upBtn.addEventListener('click', function() {
            requestLift(parseInt(this.dataset.floor), 'up');
        });
    });

    document.querySelectorAll('.btn-down').forEach((downBtn) => {
        downBtn.addEventListener('click', function() {
            requestLift(parseInt(this.dataset.floor), 'down');
        });
    });

}

/**
 * Handles lift requests
 */

const requestLift = (floor, dir) => {

    if (!floorServiced[dir][floor]) {
        liftsRequested[dir].push(floor);
        getLift(dir);
        floorServiced[dir][floor] = true;
    }
}

const getLift = (dir) => {

    while (liftsRequested[dir].length > 0) {
        let requestedFloor = liftsRequested[dir][0];
        const liftIdx = findNearestLiftAvailable(requestedFloor);
        if (liftIdx != -1) {
            moveLift(liftIdx, requestedFloor, dir);
            liftsRequested[dir].shift();
        } else {
            break;
        }
    }
}

const findNearestLiftAvailable = (requestedFloor) => {

    let nearestLiftIdx = -1, nearestLiftDist = Infinity;

    for (let idx = 0; idx < liftPositions.length; ++idx) {
        let currFloor = liftPositions[idx];
        if (isLiftAvailable[idx]) {
            let dist = Math.abs(currFloor - requestedFloor);
            if (dist < nearestLiftDist) {
                nearestLiftDist = dist;
                nearestLiftIdx = idx;
            }
        }
    }

    return nearestLiftIdx;
}

const moveLift = (src, dest, dir) => {

    const liftEl = document.querySelector(`.each-lift[data-lift="${src + 1}"]`);
    console.log(liftEl);
    const currFloor = liftPositions[src];
    const floorHeight = document.querySelector('.each-floor').offsetHeight;
    const distToCover = Math.abs(currFloor - dest);
    const time = distToCover * 2;

    isLiftAvailable[src] = false;

    liftEl.style.transition = `transform ${time}s linear`;
    liftEl.style.transform = `translate3d(0, -${floorHeight * dest}px, 0)`;

    setTimeout(() => {
        liftPositions[src] = dest;
        openLiftDoors(liftEl);

        setTimeout(() => {
            closeLiftDoors(liftEl);
            setTimeout(() => {
                isLiftAvailable[src] = true;
                floorServiced[dir][dest] = false;
                getLift(dir);
            }, 2500);
        }, 2500);
    }, time * 1000);

}

const openLiftDoors = (liftEl) => {
    liftEl.querySelector('.left-door').classList.add('open');
    liftEl.querySelector('.right-door').classList.add('open');
}

const closeLiftDoors = (liftEl) => {
    liftEl.querySelector('.left-door').classList.remove('open');
    liftEl.querySelector('.right-door').classList.remove('open');
}
