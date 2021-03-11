import { PointActor } from './PointActor';

const THREE         = require('three')
const ColladaLoader = require('three-collada-loader');

export class SuperRing extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-super-ring actor-item';

		this.args.width  = 64;
		this.args.height = 64;
		this.args.float  = -1;
		this.args.gone   = false;

		this.args.xRot = 0;
		this.args.yRot = 0;
		this.args.zRot = 0;

		this.args.speed = 4;

		this.leaving = new WeakSet;

		this.args.xOff = 0;
		this.args.yOff = 0;
	}

	onAttached()
	{
		this.initRenderer();

		this.pinch(0);
	}

	initRenderer()
	{
		this.cameraRear = new THREE.PerspectiveCamera(12.5, undefined, 10, 100);
		this.cameraFore = new THREE.PerspectiveCamera(12.5, undefined, 1, 10.1);

		const modelUrl   = '/models/ring.dae';

		const specular   = 0xBBBBBB;
		const color      = 0xBBBB00;
		const outline    = 0x000000;

		// const finalX     = qTurn / 8 * 7;

		const emissive   = 0x999900;
		const lineColor  = 0x0000AA;

		const colladaLoader = new ColladaLoader;

		colladaLoader.load(modelUrl, response => {
			const geometry = response.dae.geometries['root-mesh'].mesh.geometry3js;

			this.cameraRear.position.z = 10;
			this.cameraRear.position.x = 0;
			this.cameraRear.position.y = 0;

			this.cameraFore.position.z = 10;
			this.cameraFore.position.x = 0;
			this.cameraFore.position.y = 0;

			this.scene = new THREE.Scene();

			const edgeGeometry = new THREE.EdgesGeometry(geometry);

			const goldMaterial = new THREE.MeshPhongMaterial({
				side:          THREE.FrontSide
				, transparent: true
				, skinning:    true
				, emissive
				, specular
				, color
			});

			const blackMaterial = new THREE.MeshBasicMaterial({
				color: outline
				, side: THREE.BackSide
			});

			this.mainMesh = new THREE.Mesh(geometry, goldMaterial);
			this.outlineMesh = new THREE.Mesh(geometry, blackMaterial);
			this.inlineMesh = new THREE.Mesh(geometry, blackMaterial);

			this.outlineMesh.scale.multiplyScalar(1.075);
			this.inlineMesh.scale.multiplyScalar(0.925);

			this.wireMaterial = new THREE.LineBasicMaterial({
				depthTest:   true
				, linewidth:   1.25
				, color:       lineColor
				, transparent: true
				, opacity:     0.125
			} );

			this.wireframe = new THREE.LineSegments(edgeGeometry, this.wireMaterial);

			const light = new THREE.DirectionalLight(0xFFFFFF, 0.333);
			light.position.set(1, 1.75, 0).normalize();

			light.target = this.wireframe;

			const light2 = new THREE.DirectionalLight(0xFFFFFF);
			light2.position.set(0.75, -1, 0).normalize();

			light.target = this.wireframe;

			this.scene.add(this.mainMesh);
			this.scene.add(this.outlineMesh);
			this.scene.add(this.inlineMesh);
		 	this.scene.add(this.wireframe);

			this.scene.add(light);

			this.rendererRear = new THREE.WebGLRenderer({
				antialias: true
				, alpha:   true
			});

			this.rendererFore = new THREE.WebGLRenderer({
				antialias: true
				, alpha:   true
			});

			this.resizeRenderer();

			const parent = this.tags.sprite.node.parentNode;

			parent.appendChild(this.rendererRear.domElement);
			parent.appendChild(this.rendererFore.domElement);

			this.rendererRear.render(this.scene, this.cameraRear);
			this.rendererFore.render(this.scene, this.cameraFore);
		});

	}

	resizeRenderer()
	{
		const parent    = this.tags.sprite.node;

		const width     = this.args.width;  //parent.clientWidth  || parent.offsetWidth || width || 0;
		const height    = this.args.height; //parent.clientHeight || parent.offsetHeight || height || 0;
		const longAxis  = width > height ? width : height;
		const shortAxis = width < height ? width : height;

		this.cameraRear.aspect = 1;
		this.cameraFore.aspect = 1;

		this.rendererRear.setSize(shortAxis,  shortAxis);
		this.rendererFore.setSize(shortAxis,  shortAxis);

		// parent.style.setProperty('--long-axis', longAxis + 'px');
		// parent.style.setProperty('--short-axis', shortAxis + 'px');

		this.wireMaterial.linewidth = shortAxis / 750;
	}

	update()
	{
		super.update();

		if(!this.wireframe)
		{
			return;
		}

		if(this.caught)
		{
			this.wireframe.material.opacity = 0.125;

			const caught = this.caught;

			caught.args.xSpeed = 0;
			caught.args.ySpeed = 0;

			if(this.caught.yAxis > 0)
			{
				this.drop();
			}
			else if(this.caught.yAxis < 0)
			{
				this.wireframe.material.opacity = 0.25;

				this.args.speed++;

				caught.args.x = this.public.x;
				caught.args.y = this.public.y - 16;
			}
			else
			{
				const toX = this.public.x;
				const toY = this.public.y - 16;

				const speed = 12;

				if(caught.public.x !== toX)
				{
					caught.args.x += Math.sign(toX - caught.public.x) * this.args.speed;
				}

				if(caught.public.y !== toY)
				{
					caught.args.y += Math.sign(toY - caught.public.y) * this.args.speed;
				}

				if(Math.abs(caught.public.x - toX) < speed)
				{
					caught.args.x = toX;
				}

				if(Math.abs(caught.public.y - toY) < speed)
				{
					caught.args.y = toY;
				}
			}

			if(this.args.speed < 5)
			{
				this.args.speed += 0.25;
			}

			if(this.args.speed > 5)
			{
				this.args.speed -= 0.5;
			}
		}
		else
		{
			this.wireframe.material.opacity = 0.1;

			if(this.args.speed > 4)
			{
				this.args.speed -= 0.125;
			}
		}

		const yRot = (this.args.yRot / 60) % (Math.PI * 2);

		if(yRot > (Math.PI / 2 - 0.125) && yRot < (Math.PI / 2 + 0.125))
		{
			if(this.args.speed > 20)
			{
				this.onTimeout(500, ()=>this.drop());
			}
		}

		// this.wireframe.rotation.x
		//	= this.mainMesh.rotation.x
		//	= this.outlineMesh.rotation.x
		//	= this.inlineMesh.rotation.x
		//	= this.args.xRot / 200;


		this.wireframe.rotation.y
			= this.mainMesh.rotation.y
			= this.outlineMesh.rotation.y
			= this.inlineMesh.rotation.y
			= yRot;

		this.wireframe.rotation.z
			= this.mainMesh.rotation.z
			= this.outlineMesh.rotation.z
			= this.inlineMesh.rotation.z
			= this.args.zRot / 60;

		this.args.yRot += this.args.speed;
		// this.args.xRot++;
		this.args.zRot++;

		this.rendererRear.render(this.scene, this.cameraRear);
		this.rendererFore.render(this.scene, this.cameraFore);
	}

	collideA(other)
	{
		super.collideA(other);

		if(!other.controllable || other.public.flying)
		{
			if(this.leaving.delete(other))
			{
				return;
			}
			return;
		}

		if(this.leaving.has(other))
		{
			return;
		}

		if(this.caught)
		{
			this.caught.args.xSpeed = (Math.sign(other.public.xSpeed) * 3) || 3;

			this.leaving.add(this.caught);
		}

		if(this.caught !== other)
		{
			this.drop();

			if(this.leaving.has(other))
			{
				return;
			}

			this.onTimeout(500, () => {

				if(this.leaving.has(other))
				{
					return;
				}

				this.caught = other

			});

			this.grab();
		}

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.float  = -1;
	}

	drop()
	{
		if(this.caught)
		{
			const caught = this.caught;

			this.pinchFilterBg.classList.add('grabbing-start');
			this.pinch(-50, 15);

			this.leaving.add(caught);

			if(this.startGrab)
			{
				clearTimeout(this.startDrop);
				this.startDrop = false;
			}

			this.startDrop = this.onTimeout(150, () => {
				this.pinchFilterBg.classList.add('grabbing');

				caught.args.float = 0;
				caught.args.ySpeed = 10;

				if(this.dropDone)
				{
					clearTimeout(this.dropDone);
					this.dropDone = false;
				}

				this.dropDone = this.onTimeout(650, () => {
					this.pinchFilterBg.classList.remove('grabbing-start');
					this.pinchFilterBg.classList.remove('grabbing');
					this.pinch(0, 0);
				});

				this.caught = null;
			});

			this.onTimeout(1500, () => {
				this.leaving.delete(caught);
			});
		}
	}

	grab()
	{
		if(this.pinchFilterFg)
		{
			this.pinchFilterFg.classList.add('grabbing-start');
			this.onTimeout(150, () => {
				this.pinchFilterFg.classList.add('grabbing');

				this.pinch(0, 100);

				this.onTimeout(650, () => {
					this.pinch(0, 0);

					this.pinchFilterFg.classList.remove('grabbing-start');
					this.pinchFilterFg.classList.remove('grabbing');
				});
			});
		}
	}
}
