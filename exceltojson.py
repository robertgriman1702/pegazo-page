import pandas as pd
import os

# --- Configuración ---
# --- ¡IMPORTANTE! Ajusta esta ruta si el Excel no está junto al script ---
# Ejemplo: excel_filename = '../ruta/relativa/a/LISTA_PRECIOS.xlsx'
# Ejemplo: excel_filename = 'C:/ruta/absoluta/LISTA_PRECIOS.xlsx'
excel_filename = 'LISTA_PRECIOS.xlsx'
sheet_name_to_read = 'Oficina'
skip_rows_index = 6 # Fila 7 de Excel = índice 6

# --- Índices de las COLUMNAS (empezando en 0) ---
indice_col_id = 0          # Columna A ('COD.:') <-- AÑADIDO
indice_col_descripcion = 1 # Columna B ('DESCRIPCION:')
indice_col_precio = 7      # Columna H ('PRECIO VENTA'???) <-- VERIFICA ESTE ÍNDICE

# --- ¡IMPORTANTE! Ruta donde se guardará el JSON (accesible por la web) ---
# Ejemplo: output_json_filename = '../pegazo-page/datos_salida.json' # Si el script está un nivel arriba
output_json_filename = 'datos_salida.json' # Guarda en la misma carpeta que el script (mueve manualmente si es necesario)

# Nombres DESEADOS de las claves en el JSON final
columna_id_json = 'id' # NUEVA CLAVE PARA ID
columna_titulo_json = 'titulo'
columna_precio_json = 'precio'
columna_imagen_json = 'imagen'
placeholder_image_path = 'img/placeholder-product-default.jpg' # Ruta relativa a la web
# --- Fin Configuración ---

if not os.path.exists(excel_filename):
    print(f"Error: El archivo Excel '{excel_filename}' no se encontró.")
    exit()

df = None
try:
    df = pd.read_excel(excel_filename,
                       sheet_name=sheet_name_to_read,
                       header=None,
                       skiprows=skip_rows_index)
    print(f"Leyendo hoja '{sheet_name_to_read}' sin encabezado, saltando {skip_rows_index} filas...")

except Exception as e:
    print(f"Error al leer Excel: {e}")
    exit()

if df is None or df.empty:
     print("Error: No se pudieron leer datos del DataFrame.")
     exit()

try:
    # Seleccionar columnas por ÍNDICE
    required_indices = [indice_col_id, indice_col_descripcion, indice_col_precio]
    if not all(idx in df.columns for idx in required_indices):
         missing = [idx for idx in required_indices if idx not in df.columns]
         raise KeyError(f"Índices de columna requeridos {missing} no existen. Columnas leídas: {df.columns.tolist()}")

    df_seleccionado = df[required_indices].copy()

    # Renombrar columnas
    rename_mapping = {
        indice_col_id: columna_id_json,
        indice_col_descripcion: columna_titulo_json,
        indice_col_precio: columna_precio_json
    }
    df_renombrado = df_seleccionado.rename(columns=rename_mapping)
except KeyError as e:
     print(f"\nError: {e}")
     exit()
except Exception as e:
     print(f"\nError al seleccionar o renombrar columnas: {e}")
     exit()

# --- Limpieza y Conversión ---
# ID: Convertir a string, quitar espacios, manejar nulos
df_renombrado[columna_id_json] = df_renombrado[columna_id_json].astype(str).str.strip().fillna('NO_ID')
# Título: Convertir a string, quitar espacios, manejar nulos
df_renombrado[columna_titulo_json] = df_renombrado[columna_titulo_json].astype(str).fillna('Sin Título').str.strip()
# Precio: Convertir a string, limpiar, convertir a número
df_renombrado[columna_precio_json] = df_renombrado[columna_precio_json].astype(str).str.strip().str.replace(',', '.', regex=False)
df_renombrado[columna_precio_json] = pd.to_numeric(df_renombrado[columna_precio_json], errors='coerce')

# Eliminar filas con precio inválido (NaN) o ID inválido
original_rows = len(df_renombrado)
df_renombrado.dropna(subset=[columna_precio_json, columna_id_json], inplace=True)
df_renombrado = df_renombrado[df_renombrado[columna_id_json] != 'NO_ID']
df_renombrado = df_renombrado[df_renombrado[columna_titulo_json] != ''] # Quitar filas sin título real
removed_rows = original_rows - len(df_renombrado)
if removed_rows > 0:
    print(f"Advertencia: Se eliminaron {removed_rows} filas por datos inválidos (precio, ID o título).")

# Añadir columna imagen
df_renombrado[columna_imagen_json] = placeholder_image_path

# Ordenar y seleccionar columnas finales (incluyendo ID)
final_columns = [columna_id_json, columna_imagen_json, columna_titulo_json, columna_precio_json]
existing_final_columns = [col for col in final_columns if col in df_renombrado.columns]
df_final = df_renombrado[existing_final_columns]

# --- Convertir a JSON y Guardar ---
try:
    json_output = df_final.to_json(orient='records', indent=4, force_ascii=False)
    # Guarda en la ruta especificada en output_json_filename
    with open(output_json_filename, 'w', encoding='utf-8') as f:
        f.write(json_output)
    print(f"\n¡Éxito! Archivo JSON '{output_json_filename}' generado con {len(df_final)} productos.")
    if removed_rows > 0:
         print(f"({removed_rows} filas fueron omitidas)")

except Exception as e:
    print(f"\nError durante la conversión a JSON o al guardar: {e}")