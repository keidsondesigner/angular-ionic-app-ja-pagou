# 📱 App Já Pagou?
<img src="https://i.imgur.com/PNcKQi2.png" title="source: imgur.com" />

> Como surgiu a ideia?  <br>
A ideia de criar o "Já Pagou?" foi a atender a necessidade do meu pai, um senhor com mais de 60 anos, que precisava lembrar a data de pagamento de alguma fatura, ele sempre deixava passar um ou dois dias, as vezes mais e então pagava com juros, isso o frustava muito, então perguntei para ele "pai, se você tivesse um aplicativo que te lembra-se do vencimento de uma conta, ajudaria?", "com certezaaa... e eu me livraria do meu caderninho kkk" 

## Requisitos do Sistema
- Java JDK (versão 11 ou superior)
- Android Studio (versão 2023 ou superior)
- Node.js (versão 18.x ou superior)
- npm (versão 8.x ou superior)
- Git

## Instalação

### 1. Instalação do Ionic CLI

```bash
npm install -g @ionic/cli
```

### 2. Instalação das Dependências do Projeto

```bash
npm install
```

### 3. Instalação do Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento web
ionic serve

# Gerar build de produção
ionic build --prod
```

### Desenvolvimento Live Reload emulador

```bash
# 1. Adicionar plataforma Android
ionic capacitor add android

# 2. Copiar arquivos web para as plataformas nativas
ionic capacitor copy android

# 3. Sincronizar plugins e dependências
ionic capacitor sync android

# 4. Executar no Android
ionic capacitor run android -l --external

# 5. Abrir projeto no Android Studio
ionic capacitor open android

```

## Adicionar .xml de Permissões do Android para Notificação
[AndroidManifest.xml](android/app/src/main/AndroidManifest.xml)

android\app\src\main\AndroidManifest.xml

O arquivo AndroidManifest.xml contém as seguintes permissões necessárias:

- INTERNET
- ACCESS_NETWORK_STATE
- ACCESS_WIFI_STATE
- POST_NOTIFICATIONS
- VIBRATE
- WAKE_LOCK
- RECEIVE_BOOT_COMPLETED
- SCHEDULE_EXACT_ALARM
- USE_EXACT_ALARM
- USE_FULL_SCREEN_INTENT


```xml
<?xml version='1.0' encoding='utf-8'?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:allowBackup="true" android:icon="@mipmap/ic_launcher" android:label="@string/app_name" android:roundIcon="@mipmap/ic_launcher_round" android:supportsRtl="true" android:theme="@style/AppTheme" android:usesCleartextTraffic="true">
        <activity android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode" android:exported="true" android:label="@string/title_activity_main" android:launchMode="singleTask" android:name=".MainActivity" android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <receiver android:exported="false" android:name="com.getcapacitor.CapacitorLocalNotificationReceiver">
            <intent-filter>
                <action android:name="com.getcapacitor.localnotification.NOTIFICATION_ACTION" />
            </intent-filter>
        </receiver>
        <service android:exported="false" android:name="com.getcapacitor.CapacitorLocalNotificationService" />
        <provider android:authorities="${applicationId}.fileprovider" android:exported="false" android:grantUriPermissions="true" android:name="androidx.core.content.FileProvider">
            <meta-data android:name="android.support.FILE_PROVIDER_PATHS" android:resource="@xml/file_paths" />
        </provider>
    </application>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
</manifest>