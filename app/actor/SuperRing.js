import { PointActor } from './PointActor';

const THREE         = require('three')
const ColladaLoader = require('three-collada-loader');

export class SuperRing extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-super-ring';

		this.args.width  = 64;
		this.args.height = 64;
		this.args.float  = -1;
		this.args.gone   = false;

		this.args.xRot = 0;
		this.args.yRot = 0;
		this.args.zRot = 0;

		this.args.speed = 4;

		this.leaving = new WeakSet;
	}

	onAttached()
	{
		this.initRenderer();
	}

	initRenderer()
	{
		this.cameraRear = new THREE.PerspectiveCamera(12.5, undefined, 10, 100);
		this.cameraFore = new THREE.PerspectiveCamera(12.5, undefined, 1, 10.1);

		const modelUrl   = '/models/ring.dae';

		const specular   = 0xBBBBBB;
		const color      = 0xBBBB00;

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

			const material = new THREE.MeshPhongMaterial({
				side:          THREE.FrontSide
				, transparent: true
				, skinning:    true
				, emissive
				, specular
				, color
			});

			this.mesh = new THREE.Mesh(geometry, material);

			this.wireMaterial = new THREE.LineBasicMaterial({
				wireframe:     true
				, depthTest:   true
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

			this.scene.add(this.mesh);
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

		console.log(parent, width, height);

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

			if(this.caught.yAxis > 0)
			{

				this.drop();
			}
			else if(this.caught.yAxis < 0)
			{
				this.wireframe.material.opacity = 0.25;

				this.args.speed = 12;

				caught.args.x = this.public.x;
				caught.args.y = this.public.y - 16;
			}
			else
			{
				const toX = this.public.x;
				const toY = this.public.y - 16;

				const speed = 7;

				if(caught.public.x !== toX)
				{
					caught.args.x += Math.sign(toX - caught.public.x) * speed;
				}

				if(caught.public.y !== toY)
				{
					caught.args.y += Math.sign(toY - caught.public.y) * speed;
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
				this.args.speed += 0.125;
			}

			if(this.args.speed > 5)
			{
				this.args.speed -= 0.25;
			}
		}
		else
		{
			this.wireframe.material.opacity = 0.05;

			if(this.args.speed > 4)
			{
				this.args.speed -= 0.125;
			}
		}

		const yRot = (this.args.yRot / 60) % (Math.PI * 2);

		if(yRot > (Math.PI / 2 - 0.125) && yRot < (Math.PI / 2 + 0.125))
		{
			if(this.args.speed > 10)
			{
				this.onTimeout(500, ()=>this.drop());
			}
		}

		// this.wireframe.rotation.x = this.mesh.rotation.x = this.args.xRot / 200;
		this.wireframe.rotation.y = this.mesh.rotation.y = yRot;
		this.wireframe.rotation.z = this.mesh.rotation.z = this.args.zRot / 60;

		this.args.yRot += this.args.speed;
		// this.args.xRot++;
		this.args.zRot++;

		this.rendererRear.render(this.scene, this.cameraRear);
		this.rendererFore.render(this.scene, this.cameraFore);
	}

	collideA(other)
	{
		super.collideA(other);

		if(!other.controllable)
		{
			return;
		}

		if(this.leaving.has(other))
		{
			return;
		}

		if(this.caught)
		{
			this.caught.args.xSpeed = (Math.sign(other.public.xSpeed) * 3) || 3;

			this.drop();
		}

		this.caught = other;

		other.args.xSpeed = 0;
		other.args.ySpeed = 0;
		other.args.float  = -1;
	}

	drop()
	{
		if(this.caught)
		{
			const caught = this.caught;
			this.leaving.add(caught);
			this.onTimeout(1250, () => this.leaving.delete(caught));
			caught.args.float = 0;

			this.caught = null;
		}
	}
}
