export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.FOV = Math.PI / 3;
        this.MAX_DEPTH = 20;
        this.RAY_STEP = 0.02; // 精度向上のため少し細かく

        // --- 色設定 ---
        this.colors = {
            wall: { r: 153, g: 183, b: 220 }, // #99b7dc (水色)
            edge: '#554171',                  // #554171 (紫)
            start: '#58a6dc',                 // #58a6dc (青)
            goal:  '#ff4444',                 // 赤
            ceiling: '#111',
            floor: '#222'
        };
    }

    render(player, mazeData) {
        // 背景リセット
        this.drawBackground();

        // ターゲット情報（床の色を変える対象）
        // 座標を整数(タイル座標)に変換しておく
        const targets = [
            { 
                x: Math.floor(mazeData.start.x), 
                y: Math.floor(mazeData.start.y), 
                color: this.colors.start 
            },
            { 
                x: Math.floor(mazeData.goal.x), 
                y: Math.floor(mazeData.goal.y), 
                color: this.colors.goal 
            }
        ];

        const numRays = this.width;
        const grid = mazeData.grid;

        for (let x = 0; x < numRays; x++) {
            // レイの角度計算
            const rayScreenPos = (x / numRays - 0.5) * this.FOV;
            const rayAngle = player.angle + rayScreenPos;
            
            // 魚眼補正用（距離が歪むのを防ぐ）
            const cosFish = Math.cos(rayScreenPos);

            // 1. レイを飛ばして壁までの距離と、壁のどこに当たったかを取得
            const hit = this.castRay(player.x, player.y, rayAngle, grid, mazeData.width, mazeData.height);
            
            if (hit.dist > 0) {
                // --- 壁の描画 ---
                const correctedDist = hit.dist * cosFish;
                const wallHeight = this.height / correctedDist;
                const wallTop = (this.height - wallHeight) / 2;
                const wallBottom = (this.height + wallHeight) / 2;

                // 距離による陰影計算 (遠いほど暗く)
                // #99b7dc (153, 183, 220) をベースに計算
                const brightness = Math.min(1, 1.5 / Math.max(1, hit.dist * 0.5)); 
                
                // エッジ（辺）の描画判定
                // ブロックの端っこ(0.02以内)なら枠線の色にする
                const isEdge = hit.offset < 0.02 || hit.offset > 0.98;

                if (isEdge) {
                    this.ctx.fillStyle = this.colors.edge;
                } else {
                    const r = (this.colors.wall.r * brightness) | 0;
                    const g = (this.colors.wall.g * brightness) | 0;
                    const b = (this.colors.wall.b * brightness) | 0;
                    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                }

                // 壁本体を描画（隙間防止のため少し幅を広げるテクニックは今回使わず、シンプルに1px）
                this.ctx.fillRect(x, wallTop, 1, wallHeight);

                // 上下の辺（枠線）を描画
                this.ctx.fillStyle = this.colors.edge;
                this.ctx.fillRect(x, wallTop, 1, 1);      // 上辺
                this.ctx.fillRect(x, wallBottom - 1, 1, 1); // 下辺


                // --- 床の特別色描画 (スタート/ゴール) ---
                // 現在のレイが、ターゲット（スタート/ゴール）の床を通るか判定
                // 通る場合、その区間の床を塗り替える
                
                targets.forEach(target => {
                    const range = this.getFloorIntersection(
                        player.x, player.y, Math.cos(rayAngle), Math.sin(rayAngle),
                        target.x, target.y
                    );

                    if (range) {
                        // レイがターゲットタイルを通る範囲 [distMin, distMax]
                        // ただし、壁より手前にある部分だけを描画
                        const drawMin = Math.max(0, range.min);
                        const drawMax = Math.min(hit.dist, range.max); // 壁に隠れる部分は描かない

                        if (drawMax > drawMin) {
                            // 距離を画面Y座標に変換
                            // distance = height / (2 * y - height)  ...の逆算
                            // y = (height / distance + height) / 2
                            // ※ここでもcosFish補正を考慮して、高さ計算と整合性を取る
                            
                            const heightOnScreen = this.height / cosFish; // 基準高さ

                            const yStart = (heightOnScreen / drawMax + this.height) / 2;
                            const yEnd   = (heightOnScreen / drawMin + this.height) / 2;

                            // 描画範囲が画面内かチェック
                            const sy1 = Math.max(wallBottom, yStart);
                            const sy2 = Math.min(this.height, yEnd);

                            if (sy2 > sy1) {
                                this.ctx.fillStyle = target.color;
                                this.ctx.fillRect(x, sy1, 1, sy2 - sy1);
                            }
                        }
                    }
                });
            }
        }
    }

    drawBackground() {
        // 天井
        this.ctx.fillStyle = this.colors.ceiling;
        this.ctx.fillRect(0, 0, this.width, this.height / 2);
        // 床 (基本色)
        this.ctx.fillStyle = this.colors.floor;
        this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
    }

    // レイキャスト処理（距離だけでなく、当たった位置のオフセットも返す）
    castRay(px, py, angle, grid, mw, mh) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        let dist = 0;
        let hit = false;
        let offset = 0; // 壁のどこに当たったか (0.0 〜 1.0)

        // ステップ処理
        while (!hit && dist < this.MAX_DEPTH) {
            dist += this.RAY_STEP;
            const testX = px + cos * dist;
            const testY = py + sin * dist;
            
            const mapX = Math.floor(testX);
            const mapY = Math.floor(testY);

            // 範囲外
            if (mapX < 0 || mapX >= mw || mapY < 0 || mapY >= mh) {
                hit = true;
                dist = this.MAX_DEPTH;
            } else {
                // 壁ヒット
                if (grid[mapY][mapX] === 1) {
                    hit = true;
                    
                    // オフセット計算: ブロックの境界(整数座標)からのズレ
                    // 垂直な壁(xが整数に近い)か、水平な壁(yが整数に近い)かを判定
                    const diffX = testX - Math.floor(testX);
                    const diffY = testY - Math.floor(testY);
                    
                    // 簡易判定：中心から遠いほうが「当たった面」の可能性が高い
                    // もしくは前回位置との差分で判定するのが正確だが、簡易実装として
                    // 0.5からの距離で判定する
                    if (Math.abs(diffX - 0.5) > Math.abs(diffY - 0.5)) {
                        // 縦のラインにヒット (Y座標がオフセット)
                        offset = diffY;
                    } else {
                        // 横のラインにヒット (X座標がオフセット)
                        offset = diffX;
                    }
                }
            }
        }
        return { dist, offset };
    }

    // レイと特定のタイル(1x1の矩形)の交差判定
    // 戻り値: { min: distance, max: distance } または null
    getFloorIntersection(px, py, dirX, dirY, tileX, tileY) {
        // スラブ法によるAABB交差判定
        let tmin = 0;
        let tmax = 1000;

        // X軸方向のチェック
        if (Math.abs(dirX) < 1e-6) {
            // レイが垂直で、タイルのX範囲外なら交差なし
            if (px < tileX || px > tileX + 1) return null;
        } else {
            const tx1 = (tileX - px) / dirX;
            const tx2 = (tileX + 1 - px) / dirX;
            tmin = Math.max(tmin, Math.min(tx1, tx2));
            tmax = Math.min(tmax, Math.max(tx1, tx2));
        }

        // Y軸方向のチェック
        if (Math.abs(dirY) < 1e-6) {
            if (py < tileY || py > tileY + 1) return null;
        } else {
            const ty1 = (tileY - py) / dirY;
            const ty2 = (tileY + 1 - py) / dirY;
            tmin = Math.max(tmin, Math.min(ty1, ty2));
            tmax = Math.min(tmax, Math.max(ty1, ty2));
        }

        if (tmax < tmin || tmax < 0) return null;

        return { min: tmin, max: tmax };
    }
}