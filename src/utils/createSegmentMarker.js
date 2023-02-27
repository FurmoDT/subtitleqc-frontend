import {Label, Tag} from 'konva/lib/shapes/Label';
import {Line} from "konva/cmj/shapes/Line";

class CustomSegmentMarker {
    constructor(options) {
        this._options = options
    }

    init(group) {
        this._group = group;

        this._label = new Label({
            x: 0.5,
            y: 0.5
        });

        const color = this._options.segment.color;

        this._tag = new Tag({
            fill: color,
            stroke: color,
            strokeWidth: 1,
            pointerDirection: 'down',
            pointerWidth: 15,
            pointerHeight: 15,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowOpacity: 0.3
        });

        this._label.add(this._tag);

        this._line = new Line({
            x: 0,
            y: 0,
            stroke: color,
            strokeWidth: 1,
            dash: this._options.startMarker ? [] : [5, 5]
        });

        group.add(this._label);
        group.add(this._line);

        this.fitToView();

        this.bindEventHandlers();
    }

    bindEventHandlers() {
        this._group.on('mouseenter', () => {
            document.body.style.cursor = 'w-resize';
        });

        this._group.on('mouseleave', () => {
            document.body.style.cursor = 'default';
        });
    };

    fitToView() {
        const height = this._options.layer.getHeight();

        const offsetTop = 14;
        const offsetBottom = 26;

        this._group.y(offsetTop + 0.5);

        this._line.points([0.5, 0, 0.5, height - offsetTop - offsetBottom]);
    }
}

export function createSegmentMarker(options) {
    return new CustomSegmentMarker(options);
}