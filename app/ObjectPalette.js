import { PointActor } from './actor/PointActor';

import { LayerSwitch }    from './actor/LayerSwitch';

import { Region }      from './region/Region';
import { ShadeRegion } from './region/ShadeRegion';
import { BgShadeRegion } from './region/BgShadeRegion';
import { FgShadeRegion } from './region/FgShadeRegion';
import { WaterRegion } from './region/WaterRegion';
import { DarkRegion } from './region/DarkRegion';
import { LavaRegion } from './region/LavaRegion';
import { RollingRegion } from './region/RollingRegion';
import { GrindingRegion } from './region/GrindingRegion';
import { ForceRegion } from './region/ForceRegion';
import { CorkscrewRegion } from './region/CorkscrewRegion';
import { BossRegion } from './region/BossRegion';
import { ExitRegion } from './region/ExitRegion';
import { ExplodingRegion } from './region/ExplodingRegion'
import { SwitchRegion } from './region/SwitchRegion'
import { RainRegion } from './region/RainRegion'
import { WaterfallRegion } from './region/WaterfallRegion'

import { CompanionBlock } from './actor/CompanionBlock';
import { QuestionBlock }  from './actor/QuestionBlock';
import { MarbleBlock }    from './actor/MarbleBlock';
import { BreakableBlock } from './actor/BreakableBlock';
import { Stopper }        from './actor/Stopper';
import { Zipline }        from './actor/Zipline';
import { Block }          from './actor/Block';

import { Monitor }   from './actor/Monitor';
import { WebMonitor } from './actor/monitor/WebMonitor';
import { RingMonitor } from './actor/monitor/RingMonitor';
import { SheildStarMonitor } from './actor/monitor/SheildStarMonitor';
import { SheildNormalMonitor } from './actor/monitor/SheildNormalMonitor';
import { SheildFireMonitor } from './actor/monitor/SheildFireMonitor';
import { SheildWaterMonitor } from './actor/monitor/SheildWaterMonitor';
import { SheildElectricMonitor } from './actor/monitor/SheildElectricMonitor';

import { Bumper } from './actor/Bumper';
import { Flipper } from './actor/Flipper';
import { SeeSaw } from './actor/SeeSaw';

import { Cinematic } from './actor/Cinematic';

import { Flickie } from './actor/Flickie';

import { Bubbles  } from './actor/Bubbles';
import { Redz     } from './actor/Redz';
import { GuardBot } from './actor/GuardBot';
import { CrabMeat } from './actor/CrabMeat';
import { BuzzBomber } from './actor/BuzzBomber';
import { MechaFroggy } from './actor/MechaFroggy';
import { DrainFly } from './actor/DrainFly';

import { Explosion } from './actor/Explosion';
import { StarPost }  from './actor/StarPost';
import { ArrowSign }  from './actor/ArrowSign';
import { Emerald }   from './actor/Emerald';
import { FakeEmerald }   from './actor/FakeEmerald';
import { Window }    from './actor/Window';
import { Spring }    from './actor/Spring';

import { BrokenMonitor }  from './actor/BrokenMonitor';

import { Ring } from './actor/Ring';
import { Coin } from './actor/Coin';

import { WaterFall } from './actor/WaterFall';
import { WaterJet }  from './actor/WaterJet';

import { PowerupGlow } from './actor/PowerupGlow';
// import { SuperRing }   from './actor/SuperRing';

import { Projectile } from './actor/Projectile';
import { TextActor }  from './actor/TextActor';

import { EggMobile } from './actor/EggMobile';
import { SnowBoard }  from './actor/SnowBoard';
import { DrillCar }  from './actor/DrillCar';
import { Tornado }   from './actor/Tornado';
import { RailCar }  from './actor/RailCar';
import { EggWalker }  from './actor/EggWalker';
import { EggShuttle }  from './actor/EggShuttle';

import { NuclearSuperball } from './actor/NuclearSuperball';

import { MechaSonic } from './actor/MechaSonic';
import { Eggrobo }    from './actor/Eggrobo';
import { Eggman }     from './actor/Eggman';

import { Sonic }      from './actor/Sonic';
import { Tails }      from './actor/Tails';
import { Knuckles }   from './actor/Knuckles';

import { Seymour } from './actor/Seymour';
import { Chalmers } from './actor/Chalmers';

import { Sean } from './actor/Sean';

import { Rocks }  from './actor/Rocks';
import { Switch } from './actor/Switch';
import { HeavyDutySwitch } from './actor/HeavyDutySwitch';

import { Balloon } from './actor/Balloon';
import { StarBalloon } from './actor/StarBalloon';

import { Spinner } from './actor/Spinner';
import { Springboard } from './actor/Springboard';

import { GrapplePoint } from './actor/GrapplePoint';
import { WoodenCrate } from './actor/WoodenCrate';
import { SteelCrate } from './actor/SteelCrate';
import { ChaoCrate } from './actor/ChaoCrate';
import { UnbreakableCrate } from './actor/UnbreakableCrate';
import { Rocket } from './actor/Rocket';

import { WindStone } from './actor/WindStone';
import { RoadBarrier } from './actor/RoadBarrier';
import { Spikes } from './actor/Spikes';
import { SpikesSmall } from './actor/SpikesSmall';
import { Cone } from './actor/Cone';
import { Fountain } from './actor/Fountain';

import { CautionSign } from './actor/CautionSign';
import { RollingSign } from './actor/RollingSign';

import { Bell } from './actor/Bell';

import { Torch } from './actor/Torch';

import { Signpost } from './actor/Signpost';

import { RedEyeJet } from './actor/RedEyeJet';
import { MiniMace } from './actor/MiniMace';
import { Beelzebub } from './actor/Beelzebub';
import { MiniBoss } from './actor/MiniBoss';
import { Magnet	 } from './actor/Magnet';
import { Pulley } from './actor/Pulley';
import { PulleySmall } from './actor/PulleySmall';

import { Orb } from './actor/Orb';

import { Egg } from './actor/Egg';
import { Chao } from './actor/Chao';
import { EggShellTop } from './actor/EggShellTop';
import { EggShellBottom } from './actor/EggShellBottom';

import { BackdropSwapper } from './actor/BackdropSwapper';
import { LayerController } from './actor/LayerController';
import { WaterController } from './actor/WaterController';
import { TilesetSwapper } from './actor/TilesetSwapper';
import { CutScene } from './actor/CutScene';

import { HtmlFrame } from './actor/HtmlFrame';

import { Panel } from './actor/Panel';
import { Tester } from './actor/Tester';
import { Cursor } from './actor/Cursor';
import { Spawner } from './actor/Spawner';

export const ObjectPalette = {
	player:           NuclearSuperball
	, cinematic:      Cinematic
	, spring:         Spring
	, 'layer-switch': LayerSwitch
	, 'layer-controller': LayerController
	, 'water-controller': WaterController
	, 'backdrop-swapper': BackdropSwapper
	, 'tileset-swapper':  TilesetSwapper
	, 'star-post':    StarPost
	, 'arrow-sign':   ArrowSign
	, 'projectile':   Projectile
	, 'block':           Block
	, 'q-block':         QuestionBlock
	, 'marble-block':    MarbleBlock
	, 'companion-block': CompanionBlock
	, 'breakable-block': BreakableBlock
	, 'stopper': Stopper
	, 'zipline': Zipline
	, 'bumper':       Bumper
	, 'flipper':      Flipper
	, 'see-saw':      SeeSaw
	, 'drill-car':    DrillCar
	, 'rail-car':     RailCar
	, 'tornado':      Tornado
	, 'egg-walker':   EggWalker
	, 'snow-board':   SnowBoard
	, 'egg-mobile':   EggMobile
	, 'egg-shuttle':  EggShuttle
	, 'rocks-tall':   Rocks
	, 'rocks-med':    Rocks
	, 'rocks-short':  Rocks
	, 'mecha-sonic':  MechaSonic
	, 'sonic':        Sonic
	, 'tails':        Tails
	, 'knuckles':     Knuckles
	, 'eggman':       Eggman
	, 'robotnik':     Eggman
	, 'eggrobo':      Eggrobo
	, 'seymour':      Seymour
	, 'chalmers':     Chalmers
	, 'sean':         Sean
	, 'switch':       Switch
	, 'heavy-duty-switch': HeavyDutySwitch
	, 'window':       Window
	, 'emerald':      Emerald
	, 'fake-emerald': FakeEmerald
	, 'base-region':  Region
	, 'region':       WaterRegion
	, 'lava-region':  LavaRegion
	, 'dark-region':  DarkRegion
	, 'shade-region': ShadeRegion
	, 'force-region': ForceRegion
	, 'corkscrew-region': CorkscrewRegion
	, 'rolling-region': RollingRegion
	, 'grinding-region': GrindingRegion
	, 'exploding-region': ExplodingRegion
	, 'boss-region': BossRegion
	, 'exit-region': ExitRegion
	, 'switch-region': SwitchRegion
	, 'rain-region': RainRegion
	, 'waterfall-region': WaterfallRegion
	, 'ring':         Ring
	// , 'super-ring':   SuperRing
	, 'coin':         Coin
	, 'powerup-glow': PowerupGlow
	, 'explosion':    Explosion
	, 'text-actor':   TextActor
	, 'water-jet':    WaterJet
	, 'water-fall':   WaterFall
	, 'balloon':      Balloon
	, 'star-balloon': StarBalloon
	, 'web-monitor': WebMonitor
	, 'ring-monitor': RingMonitor
	, 'sheild-fire-monitor': SheildFireMonitor
	, 'sheild-normal-monitor': SheildNormalMonitor
	, 'sheild-star-monitor': SheildStarMonitor
	, 'sheild-water-monitor': SheildWaterMonitor
	, 'sheild-electric-monitor': SheildElectricMonitor
	, 'flickie': Flickie
	, 'crabmeat': CrabMeat
	, 'redz': Redz
	, 'guard-bot': GuardBot
	, 'mecha-froggy': MechaFroggy
	, 'buzz-bomber': BuzzBomber
	, 'bubbles': Bubbles
	, 'drainfly': DrainFly
	, 'grapple-point': GrapplePoint
	, 'rocket': Rocket
	, 'spinner': Spinner
	, 'springboard': Springboard
	, 'wooden-crate': WoodenCrate
	, 'steel-crate': SteelCrate
	, 'chao-crate': ChaoCrate
	, 'unbreakable-crate': UnbreakableCrate
	, 'road-barrier': RoadBarrier
	, 'signpost': Signpost
	, 'red-eye-jet': RedEyeJet
	, 'beelzebub': Beelzebub
	, 'mini-boss': MiniBoss
	, 'mini-mace': MiniMace
	, 'magnet': Magnet
	, 'pulley': Pulley
	, 'pulley-small': PulleySmall
	, 'spikes': Spikes
	, 'spikes-small': SpikesSmall
	, 'cone': Cone
	, 'wind-stone': WindStone
	, 'fountain': Fountain
	, 'caution-sign': CautionSign
	, 'rolling-sign': RollingSign
	, 'bell': Bell
	, 'torch': Torch
	, 'orb': Orb
	, 'chao': Chao
	, 'egg': Egg
	, 'egg-shell-top': EggShellTop
	, 'egg-shell-bottom': EggShellBottom
	, 'cut-scene': CutScene
	, 'html-frame': HtmlFrame
	, 'panel': Panel
	, 'tester': Tester
	, 'spawner': Spawner
};
