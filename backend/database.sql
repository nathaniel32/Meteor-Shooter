CREATE TABLE game_user (
    id_u VARCHAR(10) PRIMARY KEY,
    username_u VARCHAR(50),
    ip_u VARCHAR(39)
);

CREATE TABLE game_point (
    id_u VARCHAR(10),
    point_p INT,
    date_u DATETIME,
    FOREIGN KEY (id_u) REFERENCES game_user(id_u) ON DELETE RESTRICT ON UPDATE RESTRICT
);


-- ------------------------------------------------------------------------
WITH RankedScores AS (
    SELECT
        ROW_NUMBER() OVER (PARTITION BY username_u ORDER BY point_p DESC) AS No,
        username_u,
        point_p
    FROM
        game_point
)
SELECT
    No,
    username_u,
    point_p
FROM
    RankedScores
WHERE
    No = 1
ORDER BY
    point_p DESC;

-- ------------------------------------------------------------------------
SELECT
    username_u,
    point_p
FROM (
    SELECT
        username_u,
        point_p,
        ROW_NUMBER() OVER (PARTITION BY username_u ORDER BY point_p DESC) AS rnk
    FROM
        game_point
) AS RankedScores
WHERE
    rnk = 1
ORDER BY
    point_p DESC;

-- ------------------------------------------------------------------------
SELECT
    u.id_u
    username_u,
    point_p
FROM (
    SELECT
        id_u,
        point_p,
        ROW_NUMBER() OVER (PARTITION BY id_u ORDER BY point_p DESC) AS rnk
    FROM
        game_point
) AS RankedScores
JOIN
    game_user u
ON
    RankedScores.id_u = u.id_u
WHERE
    rnk = 1
ORDER BY
    point_p DESC
LIMIT 5;

--------------------------------------------------------------------------------

SET @row_number = 0;

SELECT 
    row_number,
    username_u,
    point_p
FROM (
    SELECT 
        @row_number := @row_number + 1 AS row_number,
        username_u,
        point_p
    FROM
        game_point
) AS numbered_rows
WHERE
    username_u = 'NathanielOk';


-- -------------------------------------------------------------------------------

SET @row_number = 0;

SELECT 
    row_number,
    username_u,
    point_p
FROM (
        SELECT
            @row_number := @row_number + 1 AS row_number,
            username_u,
            point_p
        FROM (
            SELECT
                username_u,
                point_p,
                ROW_NUMBER() OVER (PARTITION BY username_u ORDER BY point_p DESC) AS rnk
            FROM game_point
        ) AS RankedScores
        WHERE rnk = 1
        ORDER BY point_p DESC
    ) AS numbered_rows
WHERE username_u = 'NathanielOk';