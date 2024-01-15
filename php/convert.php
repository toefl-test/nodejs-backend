<?php
require __DIR__.'/vendor/autoload.php';

use Spipu\Html2Pdf\Html2Pdf;
use Spipu\Html2Pdf\Exception\Html2PdfException;
use Spipu\Html2Pdf\Exception\ExceptionFormatter;


try {
    $html2pdf = new Html2Pdf('P','A4','ru', true, 'UTF-8', array(20, 10, 20, 10));

    $content = file_get_contents(__DIR__.'/template.html');
    $content = '<page style="font-family: times"><br />'.nl2br($content).'</page>';

    $html2pdf->pdf->SetDisplayMode('real');
    $html2pdf->writeHTML($content);
    $html2pdf->output('utf8.pdf');
} catch (Html2PdfException $e) {
    $html2pdf->clean();

    $formatter = new ExceptionFormatter($e);
    echo $formatter->getHtmlMessage();
}
?>