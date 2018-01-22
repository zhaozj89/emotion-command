"use strict";

let NEditor = function ( editor ) {

	let signals = editor.signals;

	let container = new UI.Panel();
	container.setId( 'nEditor' );
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#272822' );
	container.setDisplay( 'none' );

	var header = new UI.Panel();
	header.setPadding( '10px' );
	container.add( header );

	var title = new UI.Text().setColor( '#fff' );
	header.add( title );

	var buttonSVG = ( function () {
		var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'width', 32 );
		svg.setAttribute( 'height', 32 );
		var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'd', 'M 12,12 L 22,22 M 22,12 12,22' );
		path.setAttribute( 'stroke', '#fff' );
		svg.appendChild( path );
		return svg;
	} )();

	var close = new UI.Element( buttonSVG );
	close.setPosition( 'absolute' );
	close.setTop( '3px' );
	close.setRight( '1px' );
	close.setCursor( 'pointer' );
	close.onClick( function () {

		container.setDisplay( 'none' );

	} );
	header.add( close );












	let renderer;

	signals.rendererChanged.add( function ( newRenderer ) {

		renderer = newRenderer;

	} );

	let graphSVG = ( function () {
		let svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'position', 'absolute' );
		svg.setAttribute( 'z-index', 1 );
		svg.setAttribute( 'width', '100%' );
		svg.setAttribute( 'height', '100%' );
		svg.setAttribute( 'id', 'node-graph' );
		svg.ns = svg.namespaceURI;
		return svg;
	} )();

	let graphPanel = new UI.Element( graphSVG );
	container.add(graphPanel);

	graphSVG.onmousemove = function(event) {
		if (NEDITOR_MOUSE_INFO.currentInput){
			let path = NEDITOR_MOUSE_INFO.currentInput.path;
			let inputPt = NEDITOR_MOUSE_INFO.currentInput.getAttachedPoint();
			let outputPt = {x: event.pageX, y: event.pageY-68};
			let val = NEditorCreatePath(inputPt, outputPt);
			path.setAttributeNS(null, 'd', val); // namespace, name, value
		}
	};

	graphSVG.onclick = function(event){
		if (NEDITOR_MOUSE_INFO.currentInput){
			NEDITOR_MOUSE_INFO.currentInput.path.removeAttribute('d');

			if (NEDITOR_MOUSE_INFO.currentInput.node)
				NEDITOR_MOUSE_INFO.currentInput.node.detachInput(NEDITOR_MOUSE_INFO.currentInput);

			NEDITOR_MOUSE_INFO.currentInput = undefined;
		}
	};

	// menu
	let menu = new UI.UList();
	menu.setId( 'menu' );
	menu.addLi( 'Modules', 'ui-state-disabled' );

	let Triggers = menu.addLi( 'Trigger' );
	let Objects = menu.addLi( 'Object' );
	let Composites = menu.addLi( 'Composites' );
	let Actions = menu.addLi( 'Actions' );
	// let Runner = menu.addLi( 'Run' );

	/////////////////////////////////////////////////////////////////
	let menuTriggers = new UI.UList();
	let buttonKeyboard = menuTriggers.addLi( 'Keyboard' );
	let buttonEmotion = menuTriggers.addLi( 'Emotion' );
	Triggers.appendChild( menuTriggers.dom );

	/////////////////////////////////////////////////////////////////
	let menuComposites = new UI.UList();
	let buttonSelector = menuComposites.addLi( 'Selector (OR)' );
	let buttonSequence = menuComposites.addLi( 'Sequence (AND)' );
	Composites.appendChild( menuComposites.dom );

	/////////////////////////////////////////////////////////////////
	let menuActions = new UI.UList();
	let buttonTranslation = menuActions.addLi( 'Translation' );
	let buttonRotation = menuActions.addLi( 'Rotation' );
	Actions.appendChild( menuActions.dom );

	menu.dom.style.position = 'absolute';
	menu.dom.style.left = '80px';
	menu.dom.style.top = '300px';
	container.add( menu );

	let manager = new NodeManager( graphSVG, container.dom );


	// jQuery methods go here ...
	$( function() {
		$( menu.dom ).draggable();
		$( "#menu" ).menu();

		$( buttonKeyboard ).click(function () {
			manager.addNode( 'key_trigger' );
		});

		$( buttonEmotion ).click(function () {
			manager.addNode( 'emotion_trigger' );
		});

		$( buttonSelector ).click( function() {
			manager.addNode( 'selector' );
		} );

		$( buttonSequence ).click( function() {
			manager.addNode( 'sequence' );
		} );

		$( buttonTranslation ).click( function() {
			manager.addNode( 'translation' );
		} );

		$( buttonRotation ).click( function() {
			manager.addNode( 'rotation' );
		} );

		$( Objects ).click( function () {
			if( currentCharacter===null ) alert( 'Please select an object first!' );
			else manager.addNode( 'object', currentCharacter );
		} );
	} );

	let currentCharacter;

	//
	signals.editorCleared.add( function () {
		container.setDisplay( 'none' );
	} );

	signals.editAST.add( function ( character ) {
		currentCharacter = character;
		container.setDisplay( '' );
	} );

	signals.trigger.add( function ( event ) {
		// evaluate ast
		let puppet = currentCharacter || editor.selected || null;

		let ast = manager.getAST();

		console.log( ast );

		// do nothing with ast now

		if( puppet===null ) return;

		if( event['type'] === 'keyboard' ) {
			if( event['KEYCODE'] === 37 ) {
				puppet.position.x+=0.1;
			}

			if( event['KEYCODE'] === 39 ) {
				puppet.position.x-=0.1;
			}
		}

		if( event['type'] === 'face' ) {
			let emotion = null;
			console.log( event['faceinfo']['emotion'] );
			switch( event['faceinfo']['emotion'] ) {
				case EMOTION_TYPE.HAPPY:
					emotion = 'happy';
					break;
				case EMOTION_TYPE.SAD:
					emotion = 'sad';
					break;
				case EMOTION_TYPE.ANGRY:
					emotion = 'angry';
					break;
				case EMOTION_TYPE.FEARFUL:
					emotion = 'fearful';
					break;
				case EMOTION_TYPE.SURPRISED:
					emotion = 'surprised';
					break;
				case EMOTION_TYPE.DISGUSTED:
					emotion = 'disgusted';
					break;
				case EMOTION_TYPE.NEUTRAL:
					emotion = 'neutral';
					break;
			}

			console.log( emotion );

			puppet.updateEmotion( emotion );
		}

		editor.signals.sceneGraphChanged.dispatch();

	} );
	return container;

};
