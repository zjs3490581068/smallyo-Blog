
// Sakura 樱花飘落特效
class Sakura {
    constructor() {
        this.start();
    }

    start() {
        // Robust check: If instance exists but canvas is gone (View Transition wiping), cleanup first.
        const existingCanvas = document.getElementById('sakura_canvas');
        if ((window as any).sakuraInstance && existingCanvas) {
            return; // Everything is fine, don't restart
        }

        if ((window as any).sakuraInstance && !existingCanvas) {
            // Zombie instance (JS object exists, but DOM is gone). Clean it up.
            (window as any).sakuraInstance.stop();
        }

        const requestAnimationFrame = window.requestAnimationFrame ||
            (window as any).mozRequestAnimationFrame ||
            (window as any).webkitRequestAnimationFrame ||
            (window as any).msRequestAnimationFrame;
        const cancelAnimationFrame = window.cancelAnimationFrame ||
            (window as any).mozCancelAnimationFrame;

        const canvas = document.createElement('canvas');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;z-index: 999999;');
        canvas.id = 'sakura_canvas';
        document.getElementsByTagName('body')[0].appendChild(canvas);

        const cxt = canvas.getContext('2d');
        const petals: any[] = [];

        // Configuration
        const numPetals = 30; // Number of petals

        class Petal {
            x: number;
            y: number;
            s: number;
            r: number;
            fn: string;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height * 2 - canvas.height;
                this.s = Math.random() + 0.5;
                this.r = Math.random();
                this.fn = 'img' + Math.floor(Math.random() * 5 + 1);
            }

            update() {
                this.x = this.x - this.r; // Wind
                this.y = this.y + this.s; // Gravity

                // Reset if out of bounds
                if (this.x > window.innerWidth || this.x < 0 || this.y > window.innerHeight || this.y < 0) {
                    if (Math.random() > 0.4) {
                        this.x = Math.random() * canvas.width;
                        this.y = -10;
                        this.s = Math.random() + 0.5;
                        this.r = Math.random();
                    }
                }
            }

            draw() {
                if (!cxt) return;
                cxt.save();
                cxt.translate(this.x, this.y);
                cxt.rotate(this.r);

                // Draw a simple petal shape
                cxt.beginPath();
                cxt.moveTo(0, 0);
                cxt.bezierCurveTo(5, -10, 10, -5, 0, 15);
                cxt.bezierCurveTo(-10, -5, -5, -10, 0, 0);
                cxt.fillStyle = 'rgba(255, 183, 197, 0.6)'; // Pink
                cxt.fill();
                cxt.closePath();

                cxt.restore();
            }
        }

        // Init petals
        for (let i = 0; i < numPetals; i++) {
            petals.push(new Petal());
        }

        let stopAnimation = false;

        const animate = () => {
            if (stopAnimation || !cxt) return;
            // Safety check: if canvas is removed from DOM externally, stop
            if (!document.getElementById('sakura_canvas')) {
                stopAnimation = true;
                return;
            }

            cxt.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(petal => {
                petal.update();
                petal.draw();
            });
            (window as any).sakuraAnimationId = requestAnimationFrame(animate);
        };

        // Handle Resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // Start
        animate();

        (window as any).sakuraInstance = {
            stop: () => {
                stopAnimation = true;
                if ((window as any).sakuraAnimationId) {
                    cancelAnimationFrame((window as any).sakuraAnimationId);
                }
                try {
                    canvas.remove();
                } catch (e) { }
                (window as any).sakuraInstance = null;
            }
        }
    }
}

export default () => {
    new Sakura();
};

export const destroySakura = () => {
    if ((window as any).sakuraInstance) {
        (window as any).sakuraInstance.stop();
    }
}
