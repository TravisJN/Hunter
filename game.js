var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	
	//objects
	function Agent () {
		this.color = "red";
		this.radius = 15;
		this.cannonWidth = 5;
		this.cannonHeight = 20;
		this.x = 0;
		this.y = 0;
		this.targetX = 0;  
		this.targetY = 0;  
		this.vx = 0;
		this.vy = 0;
		
		this.maxVelocity = 3;
		this.maxAcceleration = 0.15;
		this.rotation = 0;		
		
		//wander behavior settings
		this.wanderOffset = 75;  //how far in front of agent the wander target is
		this.wanderRadius = 15;	 //radius of the wander circle
		this.wanderRate = 5;     //the higher the wander rate, the more the agent will turn per frame
		
		this.steeringForceX = 0;
		this.steeringForceY = 0;
		
		this.lookAheadScale = 4;
	}
	
	// accumlates influences of all steering behaviors.
	function SteeringForce() {
		this.linearX = 0;
		this.linearY = 0;
	}
	
	//prototypes
	Agent.prototype.draw = function () {
		context.save();
		context.fillStyle = this.color;
		context.strokeStyle = "black";
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
		context.stroke();
		context.fill();
		
		
		context.translate(this.x, this.y);
		context.rotate(this.rotation + Math.PI / 2);
		context.fillRect(-this.cannonWidth / 2, 0, this.cannonWidth, -this.cannonHeight);
		context.strokeRect(-this.cannonWidth / 2, 0, this.cannonWidth, -this.cannonHeight);
		
		context.restore();
	}
	
	Agent.prototype.update = function () {
		this.x += this.vx;
		this.y += this.vy;
	
		this.vx += this.steeringForceX;
		this.vy += this.steeringForceY;
		
		var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
			
		//check for maximum velocity and stop accelerating when agent reaches it
		if (speed > this.maxVelocity && speed > 0) {
			this.vx = (this.vx / speed) * this.maxVelocity;
			this.vy = (this.vy / speed) * this.maxVelocity
		}
	
		this.rotation = Math.atan2(this.vy, this.vx);		
	}
	
	
	
	function seek (agent) {
		var dx, dy;
			
		dx = agent.targetX - agent.x;
		dy = agent.targetY - agent.y;		
		
		var distance = Math.sqrt(dx * dx + dy * dy);
		
		agent.steeringForceX = dx / distance * agent.maxAcceleration;
		agent.steeringForceY = dy / distance * agent.maxAcceleration;
	}
	
	function wander (agent) {		
		
		agent.targetX = agent.x + Math.cos(agent.rotation) * agent.wanderOffset;
		agent.targetY = agent.y + Math.sin(agent.rotation) * agent.wanderOffset;
		
		//draw wander circle
		context.save();
		context.beginPath();
		context.arc(agent.targetX, agent.targetY, agent.wanderRadius, 0, 2*Math.PI, true);
		context.stroke();
		context.restore();
		
		
		
		var newAngle = Math.random() * agent.wanderRate;  //random angle 
		if (Math.random() > 0.5) {
			newAngle *= -1;  //set newAngle to negative or positive randomly so agent turns left and right
		}
		agent.targetX += Math.cos(newAngle) * agent.wanderRadius;
		agent.targetY += Math.sin(newAngle) * agent.wanderRadius;
		
		return seek(agent);
	}
	
	function pursue (hunter, prey) {
		var targetX, targetY;
		var dx, dy;
		var speed, distanceToTarget;
		
		dx = prey.x - hunter.x;
		dy = prey.y - hunter.y;
		
		speed = Math.sqrt(prey.vx * prey.vx + prey.vy * prey.vy);
		distanceToTarget = Math.sqrt(dx * dx + dy * dy);
		
		hunter.targetX = prey.x + Math.cos(prey.rotation) * speed * (distanceToTarget / hunter.lookAheadScale);
		hunter.targetY = prey.y + Math.sin(prey.rotation) * speed * (distanceToTarget / hunter.lookAheadScale);
		
		//draw circle for hunter's target
		context.save();
		context.beginPath();
		context.arc(hunter.targetX, hunter.targetY, hunter.wanderRadius, 0, 2*Math.PI, true);
		context.stroke();
		context.restore();
	}
	
	function flee (hunter, prey) {
		var targetX, targetY;
		var dx, dy;
		var speed, distanceToTarget;
		
		dx = hunter.x - prey.x;
		dy = hunter.y - prey.y;
		
		speed = Math.sqrt(prey.vx * prey.vx + prey.vy * prey.vy);
		distanceToTarget = Math.sqrt(dx * dx + dy * dy);
		
		prey.targetX = hunter.x + Math.cos(hunter.rotation) * speed * (distanceToTarget / prey.lookAheadScale);
		prey.targetY = hunter.y + Math.sin(hunter.rotation) * speed * (distanceToTarget / prey.lookAheadScale);
		
		return evade (hunter, prey);
	}
	
	function evade (hunter, prey) {
		var dx, dy;
			
		dx = prey.x - prey.targetX;
		dy = prey.y - prey.targetY;		
		
		var distance = Math.sqrt(dx * dx + dy * dy);
		
		prey.steeringForceX = dx / distance * prey.maxAcceleration;
		prey.steeringForceY = dy / distance * prey.maxAcceleration;
	}
	
	function startNextRound() {
		hunter.x = utils.getRandomInt(0, canvas.width);
		hunter.y = utils.getRandomInt(0, canvas.height);
		hunter.vx = 0;
		hunter.vy = 0;
		
		prey.x = utils.getRandomInt(0, canvas.width);
		prey.y = utils.getRandomInt(0, canvas.height);
		prey.vx = 0;
		prey.vy = 0;
	}
	
	/*
	function checkBoundary (agent) {
		//check right boundary
		if (agent.x - agent.radius >= canvas.width) {
			agent.x = 0 - agent.radius + 2;  //set agent just off the left of the screen
		} else if (agent.x + agent.radius <= 0) {  //check left
			agent.x = canvas.width + agent.radius - 2;  //set agent to the right
		}
		if (agent.y - agent.radius >= canvas.height) {  //check bottom
			agent.y = 0 - agent.radius + 2;
		} else if (agent.y + agent.radius <= 0) {  //check top
			agent.y = canvas.height + agent.radius - 2;
		}
	}
	*/
	
	function checkBoundary (agent) {
		//check right boundary
		if (agent.x - agent.radius >= canvas.width) {
			return true;
		} else if (agent.x + agent.radius <= 0) {  //check left
			return true;
		}
		if (agent.y - agent.radius >= canvas.height) {  //check bottom
			return true;
		} else if (agent.y + agent.radius <= 0) {  //check top
			return true;
		}
		return false;
	}
	
	function drawHUD() {
		context.save();
		context.font="20px Georgia";
		context.fillText("Hunter: " + hunterPoints, 10, canvas.height - 35);
		context.fillText("Prey: " + preyPoints, 10, canvas.height - 15);
		context.restore();
	}
	
	var hunter = new Agent();
	hunter.x = utils.getRandomInt(0, canvas.width);
	hunter.y = utils.getRandomInt(0, canvas.height);
	hunter.maxAcceleration = 0.4;
	var	prey = new Agent();
	prey.x = utils.getRandomInt(0, canvas.width);
	prey.y = utils.getRandomInt(0, canvas.height);
	
	var isEvading = false;
	var hunterPoints = 0;
	var preyPoints = 0;
	
	//game loop
	(function tick() {
		window.requestAnimationFrame(tick, canvas);
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		var hunterToPreyDist = utils.getDistance(hunter.x, hunter.y, prey.x, prey.y);
		
		
		//checkBoundary(hunter);
		pursue(hunter, prey);
		seek(hunter);
		
		if (hunterToPreyDist > 150 && isEvading == true) {
			isEvading = false;
		} else if (hunterToPreyDist < 100 && isEvading == false) {
			isEvading = true;
		}
		
		if (!isEvading) {
			prey.color = "green";
			prey.maxVelocity = 2;
			wander(prey);
		} else {
			prey.color = "yellow";
			prey.maxVelocity = 4;
			flee(hunter, prey);
		}
		
		if (utils.areColliding(hunter.x, hunter.y, hunter.radius, prey.x, prey.y, prey.radius)) {
			hunterPoints++;
			startNextRound();
		}
		
		if (checkBoundary(prey)) {
			preyPoints++;
			startNextRound();
		}
		
		prey.update();
		prey.draw();
		hunter.update();
		hunter.draw();
		drawHUD();
	}());