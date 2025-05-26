<?php
    try {
        $dbname = 'meteorgame';
        $user = 'root';
        $password = '';

        $connect = new PDO("mysql:host=localhost;dbname=$dbname", $user, $password);
        $request_data=json_decode(file_get_contents("php://input"));
    } catch (PDOException $e) {
        echo "Verbindung Error: " . $e->getMessage();
    }

    $IP = $_SERVER['REMOTE_ADDR'];

    function generateRandomString($long) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';

        for ($i = 0; $i < $long; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }

        return $randomString;
    }

    if($request_data->action=="make_account"){
        $id = generateRandomString(10);
        $data = array(":id_u" => $id, ":this_username" => $request_data->Username, ":this_ip" => $IP);
        $query = "INSERT INTO game_user VALUES (:id_u, :this_username, :this_ip)";
        $statement = $connect->prepare($query);
        $res = $statement->execute($data);

        if ($res) {
            $output=array("Success"=>true, "Message"=> "Account Created", "Id"=>$id);
        }else{
            $output=array("Success"=>false, "Message"=> "Server Not Created");
        }

        echo json_encode($output);
        exit;
    }

    if($request_data->action=="input_point"){
        $data = array(":this_id_user" => $request_data->IdUser, ":this_point" => $request_data->Point);
        $query = "INSERT INTO game_point VALUES (:this_id_user, :this_point, CURRENT_TIMESTAMP)";
        $statement = $connect->prepare($query);
        $res = $statement->execute($data);

        if ($res) {
            $output=array("Success"=>true, "Message"=> "Point Inputted");
        }else{
            $output=array("Success"=>false, "Message"=> "Point Not Inputted");
        }

        echo json_encode($output);
        exit;
    }

    if($request_data->action=="update_top_score"){
        $query = "  WITH RankedScores AS (
                        SELECT
                            ROW_NUMBER() OVER (PARTITION BY id_u ORDER BY point_p DESC) AS No,
                            id_u,
                            point_p
                        FROM
                            game_point
                    )
                    SELECT
                        u.id_u,
                        u.username_u,
                        point_p
                    FROM
                        RankedScores r
                    JOIN
                        game_user u
                    ON
                        r.id_u = u.id_u
                    WHERE
                        No = 1
                    ORDER BY
                        point_p DESC
                    LIMIT 5;
        ";
        $statement = $connect->prepare($query);
        $res = $statement->execute();

        if ($res > 0) {
            $rowCount = $statement->rowCount();
            if ($rowCount > 0) {
                while($row=$statement->fetch(PDO::FETCH_ASSOC)){
                    $resData[]=$row;
                }
                $output=array("Success"=>true, "Message"=> "Ok", "Data" => $resData);
            }else{
                $output=array("Success"=>false, "Message"=> "Be The First Player!");
            }
        }else{
            $output=array("Success"=>false, "Message"=> "Database Error!");
        }
        echo json_encode($output);
        exit;
    }

    if($request_data->action=="update_top_score_you"){
        $data = array(":this_id_user" => $request_data->IdUser);

        $sql = " SET @row_number = 0; ";
        $sth = $connect->prepare($sql);
        $sth->execute();

        $query = "  SELECT 
                        rank_number,
                        u.username_u,
                        point_p
                    FROM (
                            SELECT
                                @row_number := @row_number + 1 AS rank_number,
                                id_u,
                                point_p
                            FROM (
                                SELECT
                                    id_u,
                                    point_p,
                                    ROW_NUMBER() OVER (PARTITION BY id_u ORDER BY point_p DESC) AS rnk
                                FROM game_point
                            ) AS RankedScores
                            WHERE rnk = 1
                            ORDER BY point_p DESC
                        ) AS numbered_rows
                    JOIN
                        game_user u
                    ON
                        numbered_rows.id_u = u.id_u
                    WHERE numbered_rows.id_u = :this_id_user;
        ";

        $statement = $connect->prepare($query);
        $res = $statement->execute($data);

        if ($res > 0) {
            $rowCount = $statement->rowCount();
            if ($rowCount > 0) {
                $row=$statement->fetch(PDO::FETCH_ASSOC);
                $resData = $row;
                $output=array("Success"=>true, "Message"=> "Ok Current", "Data" => $resData);
            }else{
                $output=array("Success"=>false, "Message"=> "Try Meteor Shooter Now!");
            }
        }else{
            $output=array("Success"=>false, "Message"=> "No Data");
        }
        echo json_encode($output);
        exit;
    }
?>