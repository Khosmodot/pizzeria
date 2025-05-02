<?php
header('Content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

class ConexionBD
{
    private $conexion;

    public function __construct()
    {
        $host = "127.0.0.1";
        $db = "pizzeria";
        $usuario = "root";
        $password = "";

        try {
            $this->conexion = new PDO("mysql:host=$host;dbname=$db", $usuario, $password, [
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"
            ]);
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo json_encode(["operacion" => "false", "mensaje" => "Error de conexión: " . $e->getMessage()]);
            exit;
        }
    }



    public function insertar($tabla, $campos, $valores)
    {
        try {
            // Validar que $tabla no contenga caracteres peligrosos (ej.: solo letras, _)
            if (!preg_match('/^[a-zA-Z_]+$/', $tabla)) {
                throw new Exception("Nombre de tabla inválido");
            }

            // Convertir campos y valores en arrays
            $arrayCampos = explode(',', $campos); // No elimines espacios aquí
            $arrayValores = explode(',', $valores); // No elimines espacios aquí

            // Crear placeholders (?, ?, ?) para PDO
            $placeholders = implode(', ', array_fill(0, count($arrayValores), '?'));

            $sql = "INSERT INTO $tabla (" . implode(', ', $arrayCampos) . ") VALUES ($placeholders)";
            $stmt = $this->conexion->prepare($sql);
            $stmt->execute($arrayValores); // Aquí PDO sanitiza automáticamente los valores

            return $stmt->rowCount();
        } catch (PDOException $e) {
            return ["operacion" => false, "mensaje" => $e->getMessage()];
        } catch (Exception $e) {
            return ["operacion" => false, "mensaje" => $e->getMessage()];
        }
    }



    // Eliminar registro
    public function eliminar($tabla, $columnaId, $valorId)
    {
        try {
            // Validar el nombre de la tabla y columna (solo letras, números y guiones bajos)
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $tabla) || !preg_match('/^[a-zA-Z0-9_]+$/', $columnaId)) {
                throw new Exception("Nombre de tabla o columna inválido");
            }

            $sql = "DELETE FROM $tabla WHERE $columnaId = :valorId";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':valorId', $valorId);
            $stmt->execute();

            return ["operacion" => "true"];
        } catch (PDOException $e) {
            return ["operacion" => "false", "mensaje" => $e->getMessage()];
        } catch (Exception $e) {
            return ["operacion" => "false", "mensaje" => $e->getMessage()];
        }
    }


    // Modificar registro
    public function modificar($tabla, $columnaId, $valorId, $campos, $valores)
    {
        try {
            // Validar que $tabla y $columnaId no contengan caracteres peligrosos
            if (!preg_match('/^[a-zA-Z_]+$/', $tabla) || !preg_match('/^[a-zA-Z_]+$/', $columnaId)) {
                throw new Exception("Nombre de tabla o columna inválido");
            }

            // Convertir campos y valores en arrays
            $arrayCampos = explode(',', $campos);
            $arrayValores = explode(',', $valores);

            // Crear la consulta SQL dinámica
            $setClause = implode(' = ?, ', $arrayCampos) . ' = ?';
            $sql = "UPDATE $tabla SET $setClause WHERE $columnaId = ?";
            $stmt = $this->conexion->prepare($sql);

            // Agregar el valor del ID al final de los valores
            $arrayValores[] = $valorId;

            // Ejecutar la consulta
            $stmt->execute($arrayValores);

            return ["operacion" => true];
        } catch (PDOException $e) {
            return ["operacion" => false, "mensaje" => $e->getMessage()];
        } catch (Exception $e) {
            return ["operacion" => false, "mensaje" => $e->getMessage()];
        }
    }

    public function validarAcceso($usuario, $password)
    {
        try {
            $stmt = $this->conexion->prepare("SELECT * FROM usuario WHERE usuario = :user AND contrasena = SHA2(:pass, 512)");
            $stmt->bindParam(":user", $usuario);
            $stmt->bindParam(":pass", $password);
            $stmt->execute();
            $result = $stmt->fetchAll();

            if (count($result) > 0) {
                return ["operacion" => "true"];
            } else {
                return ["operacion" => "false"];
            }
        } catch (PDOException $e) {
            return ["operacion" => "false", "mensaje" => $e->getMessage()];
        }
    }


    // Cargar grilla de datos
    public function cargarGrilla()
    {
        $requestData = $_REQUEST;
        error_log("Parametros recibidos: " . print_r($requestData, true));
        // Parámetros requeridos
        $tabla = $requestData['tabla'] ?? '';
        $columnasDB = isset($requestData['columnasDB']) ? json_decode($requestData['columnasDB'], true) : [];
        $columnasMostrar = isset($requestData['columnasMostrar']) ? json_decode($requestData['columnasMostrar'], true) : [];
        $join = $requestData['join'] ?? '';

        if (empty($tabla) || empty($columnasDB) || empty($columnasMostrar)) {
            return ['error' => 'Parámetros insuficientes'];
        }

        try {
            // Consulta para el total sin filtros
            $sqlTotal = "SELECT COUNT(*) as total FROM $tabla";
            $stmtTotal = $this->conexion->query($sqlTotal);
            $totalData = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

            // Construir consulta base con datos
            $sql = "SELECT SQL_CALC_FOUND_ROWS " . implode(", ", $columnasDB) . " FROM $tabla $join WHERE 1=1";
            $params = [];

            error_log("Consulta SQL: $sql");

            // Búsqueda
            if (!empty($requestData['search']['value'])) {
                $search = $requestData['search']['value'];
                $sql .= " AND (";
                $searchConditions = [];

                foreach ($columnasMostrar as $columna) {
                    if ($columna['searchable'] === true || $columna['searchable'] === "true") {
                        $searchConditions[] = $columna['name'] . " LIKE :search";
                    }
                }

                $sql .= implode(" OR ", $searchConditions) . ")";
                $params[':search'] = "%$search%";
            }

            // Consulta para obtener total filtrado (usaremos la misma consulta pero sin LIMIT)
            $sqlFiltered = str_replace("SQL_CALC_FOUND_ROWS", "", $sql);
            $stmtFiltered = $this->conexion->prepare($sqlFiltered);
            $stmtFiltered->execute($params);
            $totalFiltered = $stmtFiltered->rowCount();

            // Ordenamiento
            if (isset($requestData['order'][0]['column'])) {
                $orderColumn = $requestData['order'][0]['column'];
                $orderDir = $requestData['order'][0]['dir'];

                if (isset($columnasMostrar[$orderColumn])) {
                    $sql .= " ORDER BY " . $columnasMostrar[$orderColumn]['name'] . " " . $orderDir;
                }
            }

            // Paginación
            if (isset($requestData['start']) && $requestData['length'] != -1) {
                $sql .= " LIMIT :start, :length";
                $params[':start'] = (int)$requestData['start'];
                $params[':length'] = (int)$requestData['length'];
            }

            // Ejecutar consulta principal
            $stmt = $this->conexion->prepare($sql);

            foreach ($params as $key => &$val) {
                if ($key === ':start' || $key === ':length') {
                    $stmt->bindParam($key, $val, PDO::PARAM_INT);
                } else {
                    $stmt->bindParam($key, $val);
                }
            }

            $stmt->execute();
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Preparar datos para DataTables
            $data = [];
            foreach ($resultados as $row) {
                $nestedData = [];
                foreach ($columnasMostrar as $columna) {
                    $nestedData[$columna['db']] = $row[$columna['db']];
                }
                $data[] = $nestedData;
            }

            return [
                "draw" => intval($requestData['draw']),
                "recordsTotal" => intval($totalData),
                "recordsFiltered" => intval($totalFiltered),
                "data" => $data
            ];
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }



    public function obtenerRegistro($tabla, $columnaId, $valorId)
    {
        try {
            // Validar el nombre de la tabla y columna (solo letras, números y guiones bajos)
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $tabla) || !preg_match('/^[a-zA-Z0-9_]+$/', $columnaId)) {
                throw new Exception("Nombre de tabla o columna inválido");
            }

            $sql = "SELECT * FROM $tabla WHERE $columnaId = :valorId LIMIT 1";
            $stmt = $this->conexion->prepare($sql);
            $stmt->bindParam(':valorId', $valorId);
            $stmt->execute();
            $registro = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($registro) {
                return ["operacion" => "true", "data" => $registro];
            } else {
                return ["operacion" => "false", "mensaje" => "Registro no encontrado"];
            }
        } catch (PDOException $e) {
            return ["operacion" => "false", "mensaje" => $e->getMessage()];
        } catch (Exception $e) {
            return ["operacion" => "false", "mensaje" => $e->getMessage()];
        }
    }



}

// Controlador principal
$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

$bd = new ConexionBD();

switch ($accion) {
    case 'validarAcceso':
        $user = $_POST['loginname'] ?? '';
        $pass = $_POST['password'] ?? '';
        echo json_encode($bd->validarAcceso($user, $pass));
        break;

    case 'cargarGrilla':
        echo json_encode($bd->cargarGrilla());
        break;

    case 'obtenerRegistro':
        $tabla = $_POST['tabla'] ?? '';
        $columnaId = $_POST['columnaId'] ?? '';
        $valorId = $_POST['valorId'] ?? '';
        echo json_encode($bd->obtenerRegistro($tabla, $columnaId, $valorId));
        break;

    case 'insertar':
        $tabla = $_POST['tabla'] ?? '';
        $campos = $_POST['campos'] ?? '';
        $valores = $_POST['valores'] ?? '';
        $resultado = $bd->insertar($tabla, $campos, $valores);
        echo json_encode(["operacion" => $resultado > 0 ? "true" : "false"]);
        break;
    
    case 'eliminar':
        $tabla = $_POST['tabla'] ?? '';
        $columnaId = $_POST['columnaId'] ?? '';
        $valorId = $_POST['valorId'] ?? '';
        echo json_encode($bd->eliminar($tabla, $columnaId, $valorId));
        break;
        
    case 'modificar':
        $tabla = $_POST['tabla'] ?? '';
        $campos = $_POST['campos'] ?? '';
        $valores = $_POST['valores'] ?? '';
        $columnaId = $_POST['columnaId'] ?? '';
        $valorId = $_POST['valorId'] ?? '';
        $resultado = $bd->modificar($tabla, $columnaId, $valorId, $campos, $valores);
        echo json_encode(["operacion" => $resultado ? "true" : "false"]);
        break;

    default:
        echo json_encode(["operacion" => "false", "mensaje" => "Acción no válida"]);
}
