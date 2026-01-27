import React, { useEffect, useRef } from 'react';

const ScreenSaver: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const numCircles = 25;
        const circles: Circle[] = [];

        class Circle {
            x: number;
            y: number;
            radius: number;
            dx: number;
            dy: number;
            hue: number;
            saturation: number = 100;
            lightness: number = 50;

            constructor(x: number, y: number, radius: number, dx: number, dy: number, hue: number) {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.dx = dx;
                this.dy = dy;
                this.hue = hue;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
                ctx.fill();
                ctx.closePath();
            }

            update(width: number, height: number) {
                if (this.x + this.radius > width || this.x - this.radius < 0) {
                    this.dx = -this.dx;
                }
                if (this.y + this.radius > height || this.y - this.radius < 0) {
                    this.dy = -this.dy;
                }

                this.x += this.dx;
                this.y += this.dy;
                this.hue = (this.hue + 0.5) % 360;

                this.draw();
            }
        }

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            circles.length = 0;

            for (let i = 0; i < numCircles; i++) {
                const radius = Math.random() * 20 + 10;
                const x = Math.random() * (canvas.width - radius * 2) + radius;
                const y = Math.random() * (canvas.height - radius * 2) + radius;
                const dx = (Math.random() - 0.5) * 4;
                const dy = (Math.random() - 0.5) * 4;
                const hue = Math.random() * 360;
                circles.push(new Circle(x, y, radius, dx, dy, hue));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            circles.forEach(circle => circle.update(canvas.width, canvas.height));
            requestRef.current = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-0">
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
            />
            <div className="absolute bottom-10 left-10 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white/60 text-sm select-none pointer-events-none">
                <p className="font-bold text-white/80">Screen Saver Mode</p>
                <p>Press any key or click to exit (implement in page)</p>
            </div>
        </div>
    );
};

export default ScreenSaver;
