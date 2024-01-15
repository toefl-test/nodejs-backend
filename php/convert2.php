<?php
$replacedString = $argv[1];
$name = $argv[2];
$birthdate = $argv[3];

$tmp = __DIR__.'/tmp';
require __DIR__.'/vendor/autoload.php';
// reference the Dompdf namespace
use Dompdf\Dompdf;
use Dompdf\Options;
$content = file_get_contents(__DIR__.'/template.html');
// Define the image path
$imagePath = __DIR__ . '/signature.jpg'; // Use absolute path

// Replace {IMAGE} with the actual image tag
$content = str_replace('{IMAGE}', $imagePath, $content);
$content = str_replace('{ID}', $replacedString, $content);
$content = str_replace('{NAME}', $name, $content);
$content = str_replace('{BIRTHDATE}', $birthdate, $content);
if(isset($_GET['pdf'])){
    echo $content;
    return;
}

// instantiate and use the dompdf class
$options = new Options();
$options->set('defaultFont', 'hhh');
$options->set('isRemoteEnabled', 'true');
// $options->setPdfBackend("gd");
$options->set('fontDir', $tmp);
$options->set('fontCache', $tmp);
$options->set('tempDir', $tmp);
$options->set('chroot', realpath(''));
$dompdf = new Dompdf($options);
$dompdf->loadHtml($content);

// (Optional) Setup the paper size and orientation
$dompdf->setPaper('A4', 'portrait');

// Render the HTML as PDF
$dompdf->render();

$dompdf->stream('hello.pdf', [
    'compress' => true,
    'Attachment' => true,
]);
// Output the generated PDF to Browser
//$dompdf->stream();
?>