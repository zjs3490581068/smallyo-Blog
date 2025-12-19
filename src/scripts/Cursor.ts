
class CursorTrail {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    particles: Particle[];
    width: number;
    height: number;
    cursor: { x: number; y: number };
    animationFrame: number;

    constructor() {
        if ((window as any).cursorTrailInstance) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.cursor = { x: this.width / 2, y: this.height / 2 };
        this.particles = [];

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cursor_canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d')!;

        this.bindEvents();
        this.loop();

        (window as any).cursorTrailInstance = this;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onClick(e)); // Add click listener
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    onMouseMove(e: MouseEvent) {
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;
        this.addParticle(this.cursor.x, this.cursor.y);
    }

    onClick(e: MouseEvent) {
        const x = e.clientX;
        const y = e.clientY;
        const burstCount = 20; // Number of particles for firework

        for (let i = 0; i < burstCount; i++) {
            this.particles.push(new Particle(x, y, 'explosion'));
        }
    }

    addParticle(x: number, y: number) {
        this.particles.push(new Particle(x, y, 'trail'));
    }

    updateParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
            if (this.particles[i].lifeSpan < 0) {
                this.particles.splice(i, 1);
                i--; // Correct index after removal
            }
        }
    }

    drawParticles() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        // this.ctx.globalCompositeOperation = 'lighter'; // Optional for glow

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.beginPath();
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.lifeSpan / (p.initialLifeSpan || 120);
            this.ctx.arc(p.position.x, p.position.y, p.size, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    loop() {
        try {
            if (!document.getElementById('cursor_canvas')) {
                this.cleanup();
                return;
            }

            this.updateParticles();
            this.drawParticles();
            this.animationFrame = requestAnimationFrame(() => this.loop());
        } catch (e) { }
    }

    cleanup() {
        cancelAnimationFrame(this.animationFrame);
        try {
            this.canvas.remove();
        } catch (e) { }
        (window as any).cursorTrailInstance = null;
    }
}

class Particle {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    lifeSpan: number;
    initialLifeSpan: number;
    size: number;
    color: string;
    type: 'trail' | 'explosion';

    constructor(x: number, y: number, type: 'trail' | 'explosion' = 'trail') {
        this.position = { x: x, y: y };
        this.type = type;

        // Random pastel colors
        const colors = [
            '#FFB7C5', '#B5EAD7', '#C7CEEA', '#FFEAC1', '#FF9AA2'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        if (type === 'trail') {
            this.velocity = {
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5 + 1
            };
            this.initialLifeSpan = 60 + Math.random() * 20;
            this.size = Math.random() * 3 + 2;
        } else {
            // Explosion logic (Slower)
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5 + 0.5; // Reduced speed (was * 3 + 2)
            this.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            this.initialLifeSpan = 80 + Math.random() * 40; // Longer life (was 40 + 20)
            this.size = Math.random() * 4 + 3;
        }

        this.lifeSpan = this.initialLifeSpan;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.lifeSpan--;

        if (this.type === 'trail') {
            this.velocity.x *= 0.95;
            this.velocity.y *= 0.95;
            this.size *= 0.95;
        } else {
            this.velocity.x *= 0.96; // Less drag (was 0.92) for smoother drift
            this.velocity.y *= 0.96;
            this.velocity.y += 0.02; // Reduced gravity (was 0.1)
            this.size *= 0.97; // Slow shrink (was 0.92)
        }
    }
}

export default () => {
    const existingCanvas = document.getElementById('cursor_canvas');
    if ((window as any).cursorTrailInstance && !existingCanvas) {
        (window as any).cursorTrailInstance.cleanup();
        new CursorTrail();
    } else if (!(window as any).cursorTrailInstance) {
        new CursorTrail();
    }

    if ((window as any).cursorTrailInstance) {
        (window as any).cursorTrailInstance.onResize();
    }
};
